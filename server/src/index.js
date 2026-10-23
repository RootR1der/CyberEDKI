import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, query } from './db.js';
import { seedDatabase } from './seed.js';

import authRouter from './routes/auth.js';
import questionsRouter from './routes/questions.js';
import subjectsRouter from './routes/subjects.js';
import attemptsRouter from './routes/attempts.js';
import auditRouter from './routes/audit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await query('SELECT NOW()');
    res.json({
      status: 'ok',
      service: 'CyberEDKI Backend API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: dbCheck.rows[0].now
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      service: 'CyberEDKI Backend API',
      database: 'disconnected',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/attempts', attemptsRouter);
app.use('/api/audit-logs', auditRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: 'Внутрішня помилка сервера API' });
});

async function startServer() {
  try {
    console.log('Starting CyberEDKI Backend Server...');
    await initDatabase();
    await seedDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(` CyberEDKI Backend API listening on port ${PORT}`);
      console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

startServer();
