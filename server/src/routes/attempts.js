import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// GET all attempts (with optional userId filter)
router.get('/', async (req, res) => {
  try {
    const { userId, mode } = req.query;
    let sql = 'SELECT * FROM test_attempts WHERE 1=1';
    const params = [];

    if (userId) {
      params.push(userId);
      sql += ` AND user_id = $${params.length}`;
    }

    if (mode) {
      params.push(mode);
      sql += ` AND mode = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    const attempts = result.rows.map(a => ({
      id: a.id,
      userId: a.user_id,
      studentName: a.student_name,
      groupName: a.group_name,
      date: a.date,
      mode: a.mode,
      title: a.title,
      subjectId: a.subject_id,
      clusterId: a.cluster_id,
      totalQuestions: a.total_questions,
      correctCount: a.correct_count,
      scorePercentage: parseFloat(a.score_percentage),
      passed: a.passed,
      durationSeconds: a.duration_seconds,
      answers: typeof a.answers === 'string' ? JSON.parse(a.answers) : a.answers,
      violations: typeof a.violations === 'string' ? JSON.parse(a.violations) : a.violations,
      disqualified: a.disqualified,
      terminationReason: a.termination_reason,
      startedAt: a.started_at,
      completedAt: a.completed_at
    }));

    res.json(attempts);
  } catch (err) {
    console.error('Get attempts error:', err);
    res.status(500).json({ error: 'Помилка отримання протоколів тестувань' });
  }
});

// Check if user has already attempted simulation mode (locks retake)
router.get('/check-simulation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(
      'SELECT id, date, score_percentage, passed, disqualified, termination_reason FROM test_attempts WHERE user_id = $1 AND mode = $2 LIMIT 1',
      [userId, 'simulation']
    );

    if (result.rows.length > 0) {
      const attempt = result.rows[0];
      return res.json({
        locked: true,
        attempt: {
          id: attempt.id,
          date: attempt.date,
          scorePercentage: parseFloat(attempt.score_percentage),
          passed: attempt.passed,
          disqualified: attempt.disqualified,
          terminationReason: attempt.termination_reason
        }
      });
    }

    res.json({ locked: false });
  } catch (err) {
    console.error('Check simulation lock error:', err);
    res.status(500).json({ error: 'Помилка перевірки статусу тесту' });
  }
});

// POST save test attempt
router.post('/', async (req, res) => {
  try {
    const a = req.body;
    const id = a.id || `att-${Date.now()}`;
    const now = new Date().toISOString();

    const result = await query(
      `INSERT INTO test_attempts (
        id, user_id, student_name, group_name, date, mode, title,
        subject_id, cluster_id, total_questions, correct_count,
        score_percentage, passed, duration_seconds, answers,
        violations, disqualified, termination_reason, started_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [
        id,
        a.userId || null,
        a.studentName || 'Анонімний студент',
        a.groupName || null,
        a.date || now,
        a.mode,
        a.title,
        a.subjectId || null,
        a.clusterId || null,
        a.totalQuestions,
        a.correctCount,
        a.scorePercentage,
        a.passed,
        a.durationSeconds,
        JSON.stringify(a.answers || []),
        JSON.stringify(a.violations || []),
        a.disqualified || false,
        a.terminationReason || null,
        a.startedAt || null,
        a.completedAt || now
      ]
    );

    const saved = result.rows[0];
    res.status(201).json({
      id: saved.id,
      userId: saved.user_id,
      studentName: saved.student_name,
      groupName: saved.group_name,
      date: saved.date,
      mode: saved.mode,
      title: saved.title,
      subjectId: saved.subject_id,
      clusterId: saved.cluster_id,
      totalQuestions: saved.total_questions,
      correctCount: saved.correct_count,
      scorePercentage: parseFloat(saved.score_percentage),
      passed: saved.passed,
      durationSeconds: saved.duration_seconds,
      answers: saved.answers,
      violations: saved.violations,
      disqualified: saved.disqualified,
      terminationReason: saved.termination_reason,
      startedAt: saved.started_at,
      completedAt: saved.completed_at
    });
  } catch (err) {
    console.error('Save attempt error:', err);
    res.status(500).json({ error: 'Помилка збереження результату тестування' });
  }
});

export default router;
