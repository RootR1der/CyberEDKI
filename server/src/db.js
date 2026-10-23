import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'postgres',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'edki_user',
  password: process.env.PGPASSWORD || 'edki_secret_pass',
  database: process.env.PGDATABASE || 'cyberedki',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const query = (text, params) => pool.query(text, params);

export async function initDatabase() {
  let retries = 10;
  while (retries > 0) {
    try {
      console.log('Connecting to PostgreSQL database...');
      const client = await pool.connect();
      console.log('PostgreSQL connection established successfully.');

      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await client.query(schemaSql);
      console.log('Database schema verified/created.');

      client.release();
      break;
    } catch (err) {
      retries -= 1;
      console.error(`PostgreSQL connection failed. Retries left: ${retries}. Error: ${err.message}`);
      if (retries === 0) {
        throw new Error('Could not connect to PostgreSQL after multiple attempts.');
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

export default pool;
