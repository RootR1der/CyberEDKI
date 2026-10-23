import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// GET all audit logs
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
    const logs = result.rows.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      userId: l.user_id,
      userName: l.user_name,
      userRole: l.user_role,
      action: l.action,
      details: l.details
    }));
    res.json(logs);
  } catch (err) {
    console.error('Get audit logs error:', err);
    res.status(500).json({ error: 'Помилка отримання журналу аудиту' });
  }
});

// POST add audit log entry
router.post('/', async (req, res) => {
  try {
    const { userId, userName, userRole, action, details } = req.body;
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const result = await query(
      `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, details)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, userId || 'system', userName || 'Система', userRole || 'system', action, details || '']
    );

    const log = result.rows[0];
    res.status(201).json({
      id: log.id,
      timestamp: log.timestamp,
      userId: log.user_id,
      userName: log.user_name,
      userRole: log.user_role,
      action: log.action,
      details: log.details
    });
  } catch (err) {
    console.error('Create audit log error:', err);
    res.status(500).json({ error: 'Помилка запису в журнал аудиту' });
  }
});

export default router;
