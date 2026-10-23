import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_QUESTIONS } from '../src/data/questions';
import { SUBJECTS_DATA } from '../src/data/subjects';
import { EDKI_CLUSTERS_DATA } from '../src/data/clusters';
import { OFFICIAL_SOURCES } from '../src/data/sources';
import { MOCK_USERS, MOCK_ACADEMIC_GROUPS } from '../src/data/mockUsers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, '../server/src');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const data = {
  questions: INITIAL_QUESTIONS,
  subjects: SUBJECTS_DATA,
  clusters: EDKI_CLUSTERS_DATA,
  sources: OFFICIAL_SOURCES,
  users: MOCK_USERS,
  groups: MOCK_ACADEMIC_GROUPS
};

const outFile = path.join(outDir, 'initialData.json');
fs.writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Successfully exported initial data to ${outFile}`);
console.log(`Questions: ${data.questions.length}, Subjects: ${data.subjects.length}, Users: ${data.users.length}`);
