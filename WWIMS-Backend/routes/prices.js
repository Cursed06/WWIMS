import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// Get all waste categories and types
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.wasteCategory.findMany({
      include: {
        types: {
          include: {
            vendor: true,
            prices: true
          },
          orderBy: { waste_type_id: 'asc' }
        }
      },
      orderBy: { category_id: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get waste types grouped by category for a specific POS's linked vendors
router.get('/pos/:posId/waste-types', async (req, res) => {
  const { posId } = req.params;
  try {
    // 1. Get vendor IDs assigned to this POS
    const posVendors = await prisma.posVendor.findMany({
      where: { pos_id: posId },
      select: { vendor_id: true }
    });

    const vendorIds = posVendors.map(pv => pv.vendor_id);

    // 2. Fetch categories with waste types filtered by these vendors
    const categories = await prisma.wasteCategory.findMany({
      include: {
        types: {
          where: {
            vendor_id: { in: vendorIds }
          },
          include: {
            vendor: true,
            prices: {
              where: {
                vendor_id: { in: vendorIds }
              }
            }
          },
          orderBy: { waste_name: 'asc' }
        }
      },
      orderBy: { category_id: 'asc' }
    });

    // Clean up response format
    const result = categories.map(cat => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      types: cat.types.map(t => ({
        waste_type_id: t.waste_type_id,
        waste_name: t.waste_name,
        description: t.description,
        unit: t.unit,
        vendor_id: t.vendor_id,
        vendor_name: t.vendor.vendor_name,
        buy_price: t.prices[0] ? parseFloat(t.prices[0].buy_price) : 0,
        sell_price: t.prices[0] ? parseFloat(t.prices[0].sell_price) : 0
      }))
    })).filter(cat => cat.types.length > 0);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get prices for a specific vendor
router.get('/vendor/:vendorId', async (req, res) => {
  const { vendorId } = req.params;
  try {
    const prices = await prisma.vendorPrice.findMany({
      where: { vendor_id: vendorId },
      include: {
        waste_type: {
          include: {
            category: true
          }
        }
      }
    });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update or create pricing mapping, logging diffs to PriceHistory
router.post('/', async (req, res) => {
  const { vendor_id, waste_type_id, buy_price, sell_price } = req.body;

  if (!vendor_id || !waste_type_id || buy_price === undefined || sell_price === undefined) {
    return res.status(400).json({ error: 'vendor_id, waste_type_id, buy_price, and sell_price are required' });
  }

  const numBuy = parseFloat(buy_price);
  const numSell = parseFloat(sell_price);

  try {
    const existing = await prisma.vendorPrice.findUnique({
      where: {
        vendor_id_waste_type_id: { vendor_id, waste_type_id }
      }
    });

    let result;
    if (existing) {
      const oldBuy = parseFloat(existing.buy_price);
      const oldSell = parseFloat(existing.sell_price);

      // Check if price changed
      if (oldBuy !== numBuy || oldSell !== numSell) {
        result = await prisma.$transaction(async (tx) => {
          // 1. Update the price snapshot
          const updated = await tx.vendorPrice.update({
            where: { price_id: existing.price_id },
            data: {
              buy_price: numBuy,
              sell_price: numSell,
              updated_at: new Date()
            }
          });

          // 2. Insert record to PriceHistory
          await tx.priceHistory.create({
            data: {
              price_id: existing.price_id,
              old_buy_price: oldBuy,
              new_buy_price: numBuy,
              old_sell_price: oldSell,
              new_sell_price: numSell
            }
          });

          return updated;
        });

        // 3. Write Audit Log
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE_VENDOR_PRICE',
            entity: 'VendorPrice',
            entity_id: String(existing.price_id),
            user_id: 'admin-pusat'
          }
        });
      } else {
        result = existing;
      }
    } else {
      // Create new price relation
      result = await prisma.vendorPrice.create({
        data: {
          vendor_id,
          waste_type_id,
          buy_price: numBuy,
          sell_price: numSell
        }
      });

      // Write Audit Log
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_VENDOR_PRICE',
          entity: 'VendorPrice',
          entity_id: String(result.price_id),
          user_id: 'admin-pusat'
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price history for a specific price ID
router.get('/history/:priceId', async (req, res) => {
  try {
    const history = await prisma.priceHistory.findMany({
      where: { price_id: parseInt(req.params.priceId, 10) },
      orderBy: { changed_at: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
