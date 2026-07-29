import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// Search and get nasabah list (with data isolation if pos_id provided)
router.get('/', async (req, res) => {
  const { pos_id, search } = req.query;

  try {
    const whereClause = { is_active: true };

    if (pos_id) {
      whereClause.pos_id = pos_id;
    }

    if (search) {
      whereClause.OR = [
        { customer_id: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Limit to 50 for quick performance (<1s)
    const nasabahs = await prisma.nasabah.findMany({
      where: whereClause,
      include: {
        pos: true
      },
      take: 50,
      orderBy: { customer_id: 'asc' }
    });

    res.json(nasabahs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get individual nasabah details
router.get('/:id', async (req, res) => {
  try {
    const nasabah = await prisma.nasabah.findFirst({
      where: {
        customer_id: req.params.id,
        is_active: true
      },
      include: {
        pos: true
      }
    });

    if (!nasabah) {
      return res.status(404).json({ error: 'Customer not found or inactive' });
    }

    res.json(nasabah);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register a new customer with transactional sequence ID generation
router.post('/', async (req, res) => {
  const { pos_id, name, address, phone } = req.body;

  if (!pos_id || !name || !address) {
    return res.status(400).json({ error: 'pos_id, name, and address are required' });
  }

  const cleanPosId = pos_id.toUpperCase();

  try {
    // Verify POS exists
    const pos = await prisma.pOS.findUnique({ where: { pos_id: cleanPosId } });
    if (!pos) {
      return res.status(400).json({ error: `POS with code '${cleanPosId}' does not exist` });
    }

    // Run custom sequential generation inside a transaction block to prevent races
    const newNasabah = await prisma.$transaction(async (tx) => {
      // Fetch all customer IDs at this POS for sequence parsing
      const nasabahs = await tx.nasabah.findMany({
        where: { pos_id: cleanPosId },
        select: { customer_id: true }
      });

      let maxSeq = 0;
      for (const n of nasabahs) {
        const parts = n.customer_id.split('-');
        if (parts.length === 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }

      const nextSeq = maxSeq + 1;
      if (nextSeq > 9999) {
        throw new Error(`POS '${cleanPosId}' has reached the limit of 9999 customers.`);
      }

      const generatedId = `WW-${cleanPosId}-${String(nextSeq).padStart(4, '0')}`;

      // Insert customer
      return await tx.nasabah.create({
        data: {
          customer_id: generatedId,
          pos_id: cleanPosId,
          name,
          address,
          phone: phone || null,
          balance: 0,
          is_active: true
        }
      });
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'REGISTER_NASABAH',
        entity: 'Nasabah',
        entity_id: newNasabah.customer_id,
        user_id: 'admin-pos-' + cleanPosId.toLowerCase()
      }
    });

    res.status(201).json(newNasabah);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit nasabah
router.put('/:id', async (req, res) => {
  const { name, address, phone } = req.body;
  try {
    const updated = await prisma.nasabah.update({
      where: { customer_id: req.params.id },
      data: { name, address, phone }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_NASABAH',
        entity: 'Nasabah',
        entity_id: req.params.id,
        user_id: 'admin-pos-ba' // Simulation fallback
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Soft delete nasabah
router.delete('/:id', async (req, res) => {
  try {
    await prisma.nasabah.update({
      where: { customer_id: req.params.id },
      data: { is_active: false }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'SOFT_DELETE_NASABAH',
        entity: 'Nasabah',
        entity_id: req.params.id,
        user_id: 'admin-pos-ba' // Simulation fallback
      }
    });

    res.json({ message: 'Customer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
