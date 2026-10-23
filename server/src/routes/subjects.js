import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// GET all subjects with topics
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM subjects ORDER BY id ASC');
    const subjects = result.rows.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description,
      iconName: s.icon_name,
      isOfficial: s.is_official,
      clusterId: s.cluster_id,
      topics: typeof s.topics === 'string' ? JSON.parse(s.topics) : s.topics
    }));
    res.json(subjects);
  } catch (err) {
    console.error('Get subjects error:', err);
    res.status(500).json({ error: 'Помилка завантаження предметів' });
  }
});

// POST add subject
router.post('/', async (req, res) => {
  try {
    const { id, code, name, description, iconName, clusterId, topics } = req.body;
    const result = await query(
      `INSERT INTO subjects (id, code, name, description, icon_name, is_official, cluster_id, topics)
       VALUES ($1, $2, $3, $4, $5, false, $6, $7)
       RETURNING *`,
      [id, code, name, description || '', iconName || 'Shield', clusterId || 1, JSON.stringify(topics || [])]
    );

    const s = result.rows[0];
    res.status(201).json({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description,
      iconName: s.icon_name,
      isOfficial: s.is_official,
      clusterId: s.cluster_id,
      topics: s.topics
    });
  } catch (err) {
    console.error('Create subject error:', err);
    res.status(500).json({ error: 'Помилка створення предмета' });
  }
});

// PUT update subject (including topics)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, iconName, clusterId, topics } = req.body;
    const result = await query(
      `UPDATE subjects SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        icon_name = COALESCE($4, icon_name),
        cluster_id = COALESCE($5, cluster_id),
        topics = COALESCE($6, topics)
      WHERE id = $7
      RETURNING *`,
      [
        code,
        name,
        description,
        iconName,
        clusterId,
        topics ? JSON.stringify(topics) : null,
        parseInt(id, 10)
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Предмет не знайдено' });
    }

    const s = result.rows[0];
    res.json({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description,
      iconName: s.icon_name,
      isOfficial: s.is_official,
      clusterId: s.cluster_id,
      topics: s.topics
    });
  } catch (err) {
    console.error('Update subject error:', err);
    res.status(500).json({ error: 'Помилка оновлення предмета' });
  }
});

export default router;
