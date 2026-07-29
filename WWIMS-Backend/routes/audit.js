import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// Get audit logs
router.get('/', async (req, res) => {
  const { limit } = req.query;
  const takeLimit = limit ? parseInt(limit, 10) : 100;

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: takeLimit
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
