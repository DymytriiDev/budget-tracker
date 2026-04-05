/**
 * Migration script: Vercel Blob → Neon Postgres
 * 
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=xxx POSTGRES_URL=xxx AUTH_TOKEN=xxx npx tsx scripts/migrate-from-blob.ts
 * 
 * This script:
 * 1. Fetches existing data from Vercel Blob
 * 2. Creates tables in Postgres (if not exists)
 * 3. Inserts all data into Postgres
 */

import { list } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';

const BLOB_KEY = 'budget-state.json';

interface AppState {
  categories: { id: string; name: string; icon: string; color: string; description?: string }[];
  expenses: { id: string; categoryId: string; date: string; description: string; amount: number; ownerId?: string }[];
  budgets: { id: string; categoryId: string; month: string; limit: number; ownerId?: string; ownerSplits?: { ownerId: string; limit: number }[] }[];
  owners: { id: string; name: string; color: string }[];
  settings: { monthStartDay: number; currency?: string; defaultOwnerId?: string };
}

async function fetchFromBlob(): Promise<AppState | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required');
  }

  const { blobs } = await list({ prefix: BLOB_KEY, token });
  if (blobs.length === 0) {
    console.log('No data found in Vercel Blob');
    return null;
  }

  const response = await fetch(blobs[0].url);
  const data = await response.json();
  return data as AppState;
}

async function migrateToPostgres(state: AppState): Promise<void> {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL or DATABASE_URL is required');
  }

  const userId = process.env.AUTH_TOKEN;
  if (!userId) {
    throw new Error('AUTH_TOKEN is required (used as user identifier)');
  }

  const sql = neon(connectionString);

  // Create tables
  console.log('Creating tables...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS owners (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      month TEXT NOT NULL,
      "limit" REAL NOT NULL,
      owner_id TEXT,
      owner_splits JSONB
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      owner_id TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      month_start_day INTEGER DEFAULT 1,
      currency TEXT DEFAULT 'EUR',
      default_owner_id TEXT
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_owners_user ON owners(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)`;

  // Clear existing data for this user
  console.log('Clearing existing data...');
  await sql`DELETE FROM categories WHERE user_id = ${userId}`;
  await sql`DELETE FROM expenses WHERE user_id = ${userId}`;
  await sql`DELETE FROM budgets WHERE user_id = ${userId}`;
  await sql`DELETE FROM owners WHERE user_id = ${userId}`;
  await sql`DELETE FROM settings WHERE user_id = ${userId}`;

  // Insert categories
  console.log(`Inserting ${state.categories.length} categories...`);
  for (let i = 0; i < state.categories.length; i++) {
    const c = state.categories[i];
    await sql`
      INSERT INTO categories (id, user_id, name, icon, color, description, sort_order)
      VALUES (${c.id}, ${userId}, ${c.name}, ${c.icon}, ${c.color}, ${c.description || null}, ${i})
    `;
  }

  // Insert owners
  console.log(`Inserting ${state.owners.length} owners...`);
  for (const o of state.owners) {
    await sql`
      INSERT INTO owners (id, user_id, name, color)
      VALUES (${o.id}, ${userId}, ${o.name}, ${o.color})
    `;
  }

  // Insert budgets
  console.log(`Inserting ${state.budgets.length} budgets...`);
  for (const b of state.budgets) {
    await sql`
      INSERT INTO budgets (id, user_id, category_id, month, "limit", owner_id, owner_splits)
      VALUES (${b.id}, ${userId}, ${b.categoryId}, ${b.month}, ${b.limit}, ${b.ownerId || null}, ${b.ownerSplits ? JSON.stringify(b.ownerSplits) : null})
    `;
  }

  // Insert expenses
  console.log(`Inserting ${state.expenses.length} expenses...`);
  for (const e of state.expenses) {
    await sql`
      INSERT INTO expenses (id, user_id, category_id, date, description, amount, owner_id)
      VALUES (${e.id}, ${userId}, ${e.categoryId}, ${e.date}, ${e.description}, ${e.amount}, ${e.ownerId || null})
    `;
  }

  // Insert settings
  console.log('Inserting settings...');
  await sql`
    INSERT INTO settings (user_id, month_start_day, currency, default_owner_id)
    VALUES (${userId}, ${state.settings.monthStartDay}, ${state.settings.currency || 'EUR'}, ${state.settings.defaultOwnerId || null})
  `;
}

async function main() {
  console.log('=== Vercel Blob → Neon Postgres Migration ===\n');

  console.log('Step 1: Fetching data from Vercel Blob...');
  const state = await fetchFromBlob();
  
  if (!state) {
    console.log('No data to migrate. Exiting.');
    return;
  }

  console.log(`Found: ${state.categories.length} categories, ${state.expenses.length} expenses, ${state.budgets.length} budgets, ${state.owners.length} owners\n`);

  console.log('Step 2: Migrating to Postgres...');
  await migrateToPostgres(state);

  console.log('\n✅ Migration complete!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
