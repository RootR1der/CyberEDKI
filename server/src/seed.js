import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  try {
    const checkQuestions = await query('SELECT COUNT(*) FROM questions');
    const questionCount = parseInt(checkQuestions.rows[0].count, 10);

    if (questionCount > 0) {
      console.log(`Database already seeded (${questionCount} questions found). Skipping seed.`);
      return;
    }

    const dataFile = path.join(__dirname, 'initialData.json');
    if (!fs.existsSync(dataFile)) {
      console.warn('initialData.json not found, skipping seed.');
      return;
    }

    const rawData = fs.readFileSync(dataFile, 'utf-8');
    const initialData = JSON.parse(rawData);

    console.log('Seeding initial database data...');

    // 1. Seed Academic Groups
    if (initialData.groups && initialData.groups.length > 0) {
      for (const g of initialData.groups) {
        await query(
          `INSERT INTO academic_groups (id, name, course, specialty, student_count)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET name = $2, course = $3, specialty = $4, student_count = $5`,
          [g.id, g.name, g.course, g.specialty, g.studentCount || 0]
        );
      }
      console.log(`Seeded ${initialData.groups.length} academic groups.`);
    }

    // 2. Seed Users
    if (initialData.users && initialData.users.length > 0) {
      for (const u of initialData.users) {
        await query(
          `INSERT INTO users (id, name, first_name, last_name, role, group_name, email, username, password, is_active, department)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [
            u.id,
            u.name,
            u.firstName || '',
            u.lastName || '',
            u.role,
            u.groupName || null,
            u.email,
            u.username,
            u.password,
            u.isActive ?? true,
            u.department || null
          ]
        );
      }
      console.log(`Seeded ${initialData.users.length} users.`);
    }

    // 3. Seed Subjects
    if (initialData.subjects && initialData.subjects.length > 0) {
      for (const s of initialData.subjects) {
        await query(
          `INSERT INTO subjects (id, code, name, description, icon_name, is_official, cluster_id, topics)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             code = $2, name = $3, description = $4, icon_name = $5, is_official = $6, cluster_id = $7, topics = $8`,
          [s.id, s.code, s.name, s.description || '', s.iconName || 'Shield', s.isOfficial ?? true, s.clusterId, JSON.stringify(s.topics || [])]
        );
      }
      console.log(`Seeded ${initialData.subjects.length} subjects.`);
    }

    // 4. Seed Questions
    if (initialData.questions && initialData.questions.length > 0) {
      for (const q of initialData.questions) {
        await query(
          `INSERT INTO questions (
            id, text, options, correct_answer, cluster_id, subject_id, topic_id,
            subtopic, year, type, difficulty, explanation, option_explanations,
            source, status, created_by_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO NOTHING`,
          [
            q.id,
            q.text,
            JSON.stringify(q.options || []),
            q.correctAnswer,
            q.clusterId || null,
            q.subjectId,
            q.topicId,
            q.subtopic || '',
            q.year || null,
            q.type || 'Official',
            q.difficulty || 'Medium',
            q.explanation || '',
            JSON.stringify(q.optionExplanations || {}),
            JSON.stringify(q.source || {}),
            q.status || 'Verified',
            q.createdById || null
          ]
        );
      }
      console.log(`Seeded ${initialData.questions.length} questions successfully!`);
    }

    console.log('Database initial seeding completed.');
  } catch (err) {
    console.error('Error during database seed:', err);
  }
}
