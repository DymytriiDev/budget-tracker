import { neon } from "@neondatabase/serverless";

let migrated = false;

export async function ensureTables(): Promise<void> {
  if (migrated) return;

  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Database connection string not found");
  }

  const sql = neon(connectionString);

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

  await sql`CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_owners_user ON owners(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(user_id, month)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(user_id, date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(user_id, category_id)`;

  migrated = true;
}
