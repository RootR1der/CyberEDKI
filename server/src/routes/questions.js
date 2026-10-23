import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// GET all questions (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { subjectId, topicId, search } = req.query;
    let sql = 'SELECT * FROM questions WHERE 1=1';
    const params = [];

    if (subjectId) {
      params.push(parseInt(subjectId, 10));
      sql += ` AND subject_id = $${params.length}`;
    }

    if (topicId) {
      params.push(topicId);
      sql += ` AND topic_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (text ILIKE $${params.length} OR subtopic ILIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at DESC, id ASC';

    const result = await query(sql, params);
    const questions = result.rows.map(q => ({
      id: q.id,
      text: q.text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correct_answer,
      clusterId: q.cluster_id,
      subjectId: q.subject_id,
      topicId: q.topic_id,
      subtopic: q.subtopic,
      year: q.year,
      type: q.type,
      difficulty: q.difficulty,
      explanation: q.explanation,
      optionExplanations: typeof q.option_explanations === 'string' ? JSON.parse(q.option_explanations) : q.option_explanations,
      source: typeof q.source === 'string' ? JSON.parse(q.source) : q.source,
      status: q.status,
      createdById: q.created_by_id
    }));

    res.json(questions);
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Помилка завантаження питань' });
  }
});

// POST create question
router.post('/', async (req, res) => {
  try {
    const q = req.body;
    const id = q.id || `EDKI-CUST-${Date.now()}`;
    const result = await query(
      `INSERT INTO questions (
        id, text, options, correct_answer, cluster_id, subject_id, topic_id,
        subtopic, year, type, difficulty, explanation, option_explanations,
        source, status, created_by_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        id,
        q.text,
        JSON.stringify(q.options || []),
        q.correctAnswer,
        q.clusterId || null,
        q.subjectId,
        q.topicId,
        q.subtopic || '',
        q.year || new Date().getFullYear(),
        q.type || 'Practice',
        q.difficulty || 'Medium',
        q.explanation || '',
        JSON.stringify(q.optionExplanations || {}),
        JSON.stringify(q.source || {}),
        q.status || 'Verified',
        q.createdById || null
      ]
    );

    const saved = result.rows[0];
    res.status(201).json({
      id: saved.id,
      text: saved.text,
      options: saved.options,
      correctAnswer: saved.correct_answer,
      clusterId: saved.cluster_id,
      subjectId: saved.subject_id,
      topicId: saved.topic_id,
      subtopic: saved.subtopic,
      year: saved.year,
      type: saved.type,
      difficulty: saved.difficulty,
      explanation: saved.explanation,
      optionExplanations: saved.option_explanations,
      source: saved.source,
      status: saved.status,
      createdById: saved.created_by_id
    });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ error: 'Помилка збереження питання' });
  }
});

// PUT update question
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const q = req.body;
    const result = await query(
      `UPDATE questions SET
        text = $1, options = $2, correct_answer = $3, cluster_id = $4,
        subject_id = $5, topic_id = $6, subtopic = $7, year = $8,
        type = $9, difficulty = $10, explanation = $11, option_explanations = $12,
        source = $13, status = $14
      WHERE id = $15
      RETURNING *`,
      [
        q.text,
        JSON.stringify(q.options || []),
        q.correctAnswer,
        q.clusterId || null,
        q.subjectId,
        q.topicId,
        q.subtopic || '',
        q.year || null,
        q.type || 'Practice',
        q.difficulty || 'Medium',
        q.explanation || '',
        JSON.stringify(q.optionExplanations || {}),
        JSON.stringify(q.source || {}),
        q.status || 'Verified',
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Питання не знайдено' });
    }

    const saved = result.rows[0];
    res.json({
      id: saved.id,
      text: saved.text,
      options: saved.options,
      correctAnswer: saved.correct_answer,
      clusterId: saved.cluster_id,
      subjectId: saved.subject_id,
      topicId: saved.topic_id,
      subtopic: saved.subtopic,
      year: saved.year,
      type: saved.type,
      difficulty: saved.difficulty,
      explanation: saved.explanation,
      optionExplanations: saved.option_explanations,
      source: saved.source,
      status: saved.status,
      createdById: saved.created_by_id
    });
  } catch (err) {
    console.error('Update question error:', err);
    res.status(500).json({ error: 'Помилка оновлення питання' });
  }
});

// DELETE question
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM questions WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ error: 'Помилка видалення питання' });
  }
});

export default router;
