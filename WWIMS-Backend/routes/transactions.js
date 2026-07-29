import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// 1. Manual Penimbangan (Deposit Waste) API with ACID transaction guarantees
router.post('/weigh', async (req, res) => {
  const { customer_id, pos_id, vendor_id, items, created_by } = req.body;

  if (!customer_id || !pos_id || !vendor_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customer_id, pos_id, vendor_id, and non-empty items array are required' });
  }

  try {
    // Look up customer to make sure they exist
    const nasabah = await prisma.nasabah.findUnique({ where: { customer_id } });
    if (!nasabah) {
      return res.status(404).json({ error: `Customer with ID '${customer_id}' not found` });
    }

    // Process each item and fetch prices within an atomic Prisma transaction block
    const transactionResult = await prisma.$transaction(async (tx) => {
      let totalBuyValue = 0;
      let totalSellValue = 0;
      const detailItems = [];

      for (const item of items) {
        const { waste_type_id, quantity } = item;
        const qtyNum = parseFloat(quantity);
        if (isNaN(qtyNum) || qtyNum <= 0) {
          throw new Error(`Invalid quantity for item ${waste_type_id}`);
        }

        // Fetch waste type info to check default units
        const wasteType = await tx.wasteType.findUnique({ where: { waste_type_id } });
        if (!wasteType) {
          throw new Error(`Waste type '${waste_type_id}' does not exist`);
        }

        // FR-04: Jelantah (JE-01) always maps to Metro Oil (V-MO)
        const activeVendorId = waste_type_id === 'JE-01' ? 'V-MO' : vendor_id;

        // Fetch vendor price for this waste type
        const vendorPrice = await tx.vendorPrice.findUnique({
          where: {
            vendor_id_waste_type_id: {
              vendor_id: activeVendorId,
              waste_type_id
            }
          }
        });

        if (!vendorPrice) {
          throw new Error(`Price list not configured for waste type '${waste_type_id}' under vendor '${activeVendorId}'`);
        }

        const buyPrice = parseFloat(vendorPrice.buy_price);
        const sellPrice = parseFloat(vendorPrice.sell_price);

        const itemBuySubtotal = qtyNum * buyPrice;
        const itemSellSubtotal = qtyNum * sellPrice;

        totalBuyValue += itemBuySubtotal;
        totalSellValue += itemSellSubtotal;

        detailItems.push({
          waste_type_id,
          quantity: qtyNum,
          unit: wasteType.unit,
          price_snapshot: buyPrice,
          subtotal: itemBuySubtotal
        });
      }

      // FR-05: Auto calculate profit split
      const margin = totalSellValue - totalBuyValue;
      const posProfit = margin * 0.70;
      const pusatProfit = margin * 0.30;
      const nasabahCredit = totalBuyValue;

      // 1. Create weighing transaction parent record
      const newTransaction = await tx.transaksiPenimbangan.create({
        data: {
          customer_id,
          pos_id,
          vendor_id,
          total_buy_value: totalBuyValue,
          total_sell_value: totalSellValue,
          margin,
          pos_profit: posProfit,
          pusat_profit: pusatProfit,
          nasabah_credit: nasabahCredit,
          created_by: created_by || null
        }
      });

      // 2. Create detail records linked to parent
      for (const detail of detailItems) {
        await tx.detailPenimbangan.create({
          data: {
            transaction_id: newTransaction.transaction_id,
            waste_type_id: detail.waste_type_id,
            quantity: detail.quantity,
            unit: detail.unit,
            price_snapshot: detail.price_snapshot,
            subtotal: detail.subtotal
          }
        });
      }

      // 3. Atomically update nasabah balance
      const updatedNasabah = await tx.nasabah.update({
        where: { customer_id },
        data: {
          balance: { increment: nasabahCredit }
        }
      });

      // 4. Write audit log
      await tx.auditLog.create({
        data: {
          action: 'DEPOSIT_WEIGHING',
          entity: 'TransaksiPenimbangan',
          entity_id: String(newTransaction.transaction_id),
          user_id: created_by || 'admin-pos-ba'
        }
      });

      return { transaction: newTransaction, newBalance: updatedNasabah.balance };
    });

    res.status(201).json(transactionResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Withdrawal (Penarikan) API with ACID checks
router.post('/withdraw', async (req, res) => {
  const { customer_id, pos_id, amount, proof_image_url, created_by } = req.body;

  if (!customer_id || !pos_id || !amount) {
    return res.status(400).json({ error: 'customer_id, pos_id, and amount are required' });
  }

  const amtNum = parseFloat(amount);
  if (isNaN(amtNum) || amtNum <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal amount' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch customer details with locking (implicit read-write transaction guarantees)
      const nasabah = await tx.nasabah.findUnique({
        where: { customer_id }
      });

      if (!nasabah) {
        throw new Error(`Customer '${customer_id}' not found`);
      }

      const currentBalance = parseFloat(nasabah.balance);

      // Check balance sufficiency
      if (currentBalance < amtNum) {
        throw new Error(`Insufficient balance. Current balance is Rp ${currentBalance.toLocaleString()}, requested Rp ${amtNum.toLocaleString()}.`);
      }

      // 2. Create withdrawal record
      const withdrawal = await tx.transaksiPenarikan.create({
        data: {
          customer_id,
          pos_id,
          amount: amtNum,
          proof_image_url: proof_image_url || null,
          created_by: created_by || null
        }
      });

      // 3. Atomically decrement balance
      const updated = await tx.nasabah.update({
        where: { customer_id },
        data: {
          balance: { decrement: amtNum }
        }
      });

      // 4. Log the action
      await tx.auditLog.create({
        data: {
          action: 'BALANCE_WITHDRAWAL',
          entity: 'TransaksiPenarikan',
          entity_id: String(withdrawal.withdrawal_id),
          user_id: created_by || 'admin-pos-ba'
        }
      });

      return { withdrawal, newBalance: updated.balance };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get transaction history feed with POS isolation support
router.get('/history', async (req, res) => {
  const { pos_id, customer_id, limit } = req.query;
  const takeLimit = limit ? parseInt(limit, 10) : 50;

  try {
    const weighClause = {};
    const withdrawClause = {};

    if (pos_id) {
      weighClause.pos_id = pos_id;
      withdrawClause.pos_id = pos_id;
    }

    if (customer_id) {
      weighClause.customer_id = customer_id;
      withdrawClause.customer_id = customer_id;
    }

    // Fetch deposits
    const deposits = await prisma.transaksiPenimbangan.findMany({
      where: weighClause,
      include: {
        customer: true,
        details: {
          include: {
            waste_type: true
          }
        }
      },
      take: takeLimit,
      orderBy: { transaction_date: 'desc' }
    });

    // Fetch withdrawals
    const withdrawals = await prisma.transaksiPenarikan.findMany({
      where: withdrawClause,
      include: {
        customer: true
      },
      take: takeLimit,
      orderBy: { withdrawal_date: 'desc' }
    });

    // Merge & Sort
    const history = [
      ...deposits.map(d => ({
        id: d.transaction_id,
        type: 'DEPOSIT',
        date: d.transaction_date,
        customer_id: d.customer_id,
        customer_name: d.customer.name,
        amount: parseFloat(d.nasabah_credit),
        margin: parseFloat(d.margin),
        pos_profit: parseFloat(d.pos_profit),
        pusat_profit: parseFloat(d.pusat_profit),
        details: d.details.map(det => ({
          name: det.waste_type.waste_name,
          quantity: parseFloat(det.quantity),
          unit: det.unit,
          price: parseFloat(det.price_snapshot),
          subtotal: parseFloat(det.subtotal)
        }))
      })),
      ...withdrawals.map(w => ({
        id: w.withdrawal_id,
        type: 'WITHDRAWAL',
        date: w.withdrawal_date,
        customer_id: w.customer_id,
        customer_name: w.customer.name,
        amount: parseFloat(w.amount),
        proof_image_url: w.proof_image_url
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(history.slice(0, takeLimit));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Aggregate dashboard and metrics endpoint
router.get('/metrics', async (req, res) => {
  const { pos_id } = req.query;

  try {
    const filter = pos_id ? { pos_id } : {};

    // Get total nasabah count
    const totalCustomers = await prisma.nasabah.count({
      where: { ...filter, is_active: true }
    });

    // Get sum of current active balances
    const balanceAggr = await prisma.nasabah.aggregate({
      where: { ...filter, is_active: true },
      _sum: {
        balance: true
      }
    });

    // Weighing aggregations
    const weighingAggr = await prisma.transaksiPenimbangan.aggregate({
      where: filter,
      _sum: {
        total_buy_value: true,
        total_sell_value: true,
        pos_profit: true,
        pusat_profit: true
      }
    });

    // Withdrawal aggregations
    const withdrawalAggr = await prisma.transaksiPenarikan.aggregate({
      where: filter,
      _sum: {
        amount: true
      }
    });

    res.json({
      customerCount: totalCustomers,
      totalCustomerBalance: parseFloat(balanceAggr._sum.balance || 0),
      totalDepositedBuy: parseFloat(weighingAggr._sum.total_buy_value || 0),
      totalDepositedSell: parseFloat(weighingAggr._sum.total_sell_value || 0),
      totalPosProfit: parseFloat(weighingAggr._sum.pos_profit || 0),
      totalPusatProfit: parseFloat(weighingAggr._sum.pusat_profit || 0),
      totalWithdrawn: parseFloat(withdrawalAggr._sum.amount || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
