import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// Get all POS with their assigned vendors
router.get('/', async (req, res) => {
  try {
    const posList = await prisma.pOS.findMany({
      include: {
        pos_vendors: {
          include: {
            vendor: true
          }
        }
      }
    });
    res.json(posList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new POS
router.post('/', async (req, res) => {
  const { pos_id, pos_name, address } = req.body;
  if (!pos_id || !pos_name || !address) {
    return res.status(400).json({ error: 'pos_id, pos_name, and address are required' });
  }

  // Validate 2-letter uppercase constraint
  const code = pos_id.toUpperCase();
  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) {
    return res.status(400).json({ error: 'POS code must be exactly 2 uppercase letters' });
  }

  try {
    const existing = await prisma.pOS.findUnique({ where: { pos_id: code } });
    if (existing) {
      return res.status(400).json({ error: `POS code '${code}' already exists` });
    }

    const newPos = await prisma.pOS.create({
      data: {
        pos_id: code,
        pos_name,
        address
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_POS',
        entity: 'POS',
        entity_id: code,
        user_id: 'admin-pusat' // Simulation user
      }
    });

    res.status(201).json(newPos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vendors
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a vendor
router.post('/vendors', async (req, res) => {
  const { vendor_id, vendor_name, contact } = req.body;
  if (!vendor_id || !vendor_name) {
    return res.status(400).json({ error: 'vendor_id and vendor_name are required' });
  }
  try {
    const newVendor = await prisma.vendor.create({
      data: { vendor_id, vendor_name, contact }
    });
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign vendor to POS
router.post('/assign-vendor', async (req, res) => {
  const { pos_id, vendor_id } = req.body;
  if (!pos_id || !vendor_id) {
    return res.status(400).json({ error: 'pos_id and vendor_id are required' });
  }

  try {
    // Check if relation already exists
    const existing = await prisma.posVendor.findUnique({
      where: {
        pos_id_vendor_id: { pos_id, vendor_id }
      }
    });

    if (existing) {
      return res.json({ message: 'Vendor already assigned to this POS' });
    }

    // Create association
    const newAssociation = await prisma.posVendor.create({
      data: { pos_id, vendor_id }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'ASSIGN_VENDOR_TO_POS',
        entity: 'POS_Vendor',
        entity_id: `${pos_id}_${vendor_id}`,
        user_id: 'admin-pusat'
      }
    });

    res.status(201).json(newAssociation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove vendor assignment from POS
router.post('/remove-vendor', async (req, res) => {
  const { pos_id, vendor_id } = req.body;
  if (!pos_id || !vendor_id) {
    return res.status(400).json({ error: 'pos_id and vendor_id are required' });
  }
  try {
    await prisma.posVendor.delete({
      where: {
        pos_id_vendor_id: { pos_id, vendor_id }
      }
    });
    res.json({ message: 'Vendor assignment removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
