import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Database connection string not found. Set POSTGRES_URL or DATABASE_URL.');
    }
    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
  }
  return db;
}

export { schema };
