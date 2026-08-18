import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// Get audit logs with optional user info
router.get('/', async (req, res) => {
  const { limit, pos_id } = req.query;
  const takeLimit = limit ? parseInt(limit, 10) : 100;

  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        creator: {
          select: {
            user_id: true,
            username: true,
            role: true,
            pos_id: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: takeLimit
    });

    res.json(logs.map(log => ({
      log_id: log.log_id,
      action: log.action,
      entity: log.entity,
      entity_id: log.entity_id,
      details_summary: log.details_summary || `${log.action} on ${log.entity} #${log.entity_id || ''}`,
      timestamp: log.timestamp,
      user_id: log.user_id,
      username: log.creator?.username || log.user_id || 'system',
      user_role: log.creator?.role || null,
      user_pos_id: log.creator?.pos_id || null
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
