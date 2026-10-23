import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Логін та пароль обовʼязкові' });
    }

    const result = await query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Користувача з таким логіном не знайдено' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Невірний пароль' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Обліковий запис деактивовано адміністратором' });
    }

    const appUser = {
      id: user.id,
      name: user.name,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      groupName: user.group_name,
      email: user.email,
      username: user.username,
      password: user.password,
      isActive: user.is_active,
      department: user.department,
      createdAt: user.created_at
    };

    res.json({ user: appUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Помилка сервера при авторизації' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      groupName: user.group_name,
      email: user.email,
      username: user.username,
      password: user.password,
      isActive: user.is_active,
      department: user.department,
      createdAt: user.created_at
    }));
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Помилка отримання користувачів' });
  }
});

// Add user
router.post('/users', async (req, res) => {
  try {
    const { name, firstName, lastName, role, groupName, email, username, password, department } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'Не всі обовʼязкові поля заповнені' });
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const result = await query(
      `INSERT INTO users (id, name, first_name, last_name, role, group_name, email, username, password, is_active, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10)
       RETURNING *`,
      [id, name, firstName || '', lastName || '', role, groupName || null, email || '', username, password, department || null]
    );

    const user = result.rows[0];
    res.status(201).json({
      id: user.id,
      name: user.name,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      groupName: user.group_name,
      email: user.email,
      username: user.username,
      password: user.password,
      isActive: user.is_active,
      department: user.department,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('Create user error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Користувач із таким логіном вже існує' });
    }
    res.status(500).json({ error: 'Помилка створення користувача' });
  }
});

// Toggle user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await query('UPDATE users SET is_active = $1 WHERE id = $2', [isActive, id]);
    res.json({ success: true, isActive });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Помилка оновлення статусу' });
  }
});

// Reset password
router.patch('/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Пароль обовʼязковий' });
    await query('UPDATE users SET password = $1 WHERE id = $2', [password, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Помилка оновлення пароля' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Помилка видалення користувача' });
  }
});

// Groups
router.get('/groups', async (req, res) => {
  try {
    const result = await query('SELECT * FROM academic_groups ORDER BY course ASC, name ASC');
    const groups = result.rows.map(g => ({
      id: g.id,
      name: g.name,
      course: g.course,
      specialty: g.specialty,
      studentCount: g.student_count
    }));
    res.json(groups);
  } catch (err) {
    console.error('Get groups error:', err);
    res.status(500).json({ error: 'Помилка отримання академічних груп' });
  }
});

router.post('/groups', async (req, res) => {
  try {
    const { name, course, specialty } = req.body;
    const id = `grp-${Date.now()}`;
    const result = await query(
      `INSERT INTO academic_groups (id, name, course, specialty, student_count)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [id, name, course || 4, specialty || '125 Кібербезпека']
    );
    const g = result.rows[0];
    res.status(201).json({
      id: g.id,
      name: g.name,
      course: g.course,
      specialty: g.specialty,
      studentCount: g.student_count
    });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Помилка додавання групи' });
  }
});

router.delete('/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM academic_groups WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ error: 'Помилка видалення академічної групи' });
  }
});

export default router;
