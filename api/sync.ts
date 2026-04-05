import { neon } from "@neondatabase/serverless";
import { ensureTables } from "../src/db/migrate";

interface AppState {
  categories: {
    id: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
  }[];
  expenses: {
    id: string;
    categoryId: string;
    date: string;
    description: string;
    amount: number;
    ownerId?: string;
  }[];
  budgets: {
    id: string;
    categoryId: string;
    month: string;
    limit: number;
    ownerId?: string;
    ownerSplits?: { ownerId: string; limit: number }[];
  }[];
  owners: { id: string; name: string; color: string }[];
  settings: {
    monthStartDay: number;
    currency?: string;
    defaultOwnerId?: string;
  };
}

function getToken(req: any): string | null {
  const auth = req.headers?.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

function unauthorized(res: any) {
  return res.status(401).json({ error: "Unauthorized" });
}

export default async function handler(req: any, res: any) {
  const token = getToken(req);
  if (!token || token !== process.env.AUTH_TOKEN) {
    return unauthorized(res);
  }

  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Database connection string not set");
    return res
      .status(500)
      .json({ error: "Server configuration error: Database not configured" });
  }

  // Auto-migrate on first request
  try {
    await ensureTables();
  } catch (err) {
    console.error("Migration error:", err);
    return res.status(500).json({ error: "Database migration failed" });
  }

  const sql = neon(connectionString);
  const userId = token; // Use token as user identifier

  if (req.method === "GET") {
    try {
      const [categories, expenses, budgets, owners, settingsRows] =
        await Promise.all([
          sql`SELECT id, name, icon, color, description, sort_order FROM categories WHERE user_id = ${userId} ORDER BY sort_order`,
          sql`SELECT id, category_id, date, description, amount, owner_id FROM expenses WHERE user_id = ${userId}`,
          sql`SELECT id, category_id, month, "limit", owner_id, owner_splits FROM budgets WHERE user_id = ${userId}`,
          sql`SELECT id, name, color FROM owners WHERE user_id = ${userId}`,
          sql`SELECT month_start_day, currency, default_owner_id FROM settings WHERE user_id = ${userId}`,
        ]);

      const settings = settingsRows[0] || {
        month_start_day: 1,
        currency: "EUR",
        default_owner_id: null,
      };

      const data: AppState = {
        categories: categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          description: c.description,
        })),
        expenses: expenses.map((e: any) => ({
          id: e.id,
          categoryId: e.category_id,
          date: e.date,
          description: e.description,
          amount: e.amount,
          ownerId: e.owner_id,
        })),
        budgets: budgets.map((b: any) => ({
          id: b.id,
          categoryId: b.category_id,
          month: b.month,
          limit: b.limit,
          ownerId: b.owner_id,
          ownerSplits: b.owner_splits,
        })),
        owners: owners.map((o: any) => ({
          id: o.id,
          name: o.name,
          color: o.color,
        })),
        settings: {
          monthStartDay: settings.month_start_day,
          currency: settings.currency || "EUR",
          defaultOwnerId: settings.default_owner_id,
        },
      };

      return res.status(200).json({ data });
    } catch (err) {
      console.error("Sync GET error:", err);
      return res.status(500).json({ error: "Failed to read state" });
    }
  }

  if (req.method === "POST") {
    try {
      const state: AppState = req.body;

      // Delete existing data for this user
      await Promise.all([
        sql`DELETE FROM categories WHERE user_id = ${userId}`,
        sql`DELETE FROM expenses WHERE user_id = ${userId}`,
        sql`DELETE FROM budgets WHERE user_id = ${userId}`,
        sql`DELETE FROM owners WHERE user_id = ${userId}`,
        sql`DELETE FROM settings WHERE user_id = ${userId}`,
      ]);

      // Insert categories
      for (let i = 0; i < state.categories.length; i++) {
        const c = state.categories[i];
        await sql`
          INSERT INTO categories (id, user_id, name, icon, color, description, sort_order)
          VALUES (${c.id}, ${userId}, ${c.name}, ${c.icon}, ${c.color}, ${c.description || null}, ${i})
        `;
      }

      // Insert owners
      for (const o of state.owners) {
        await sql`
          INSERT INTO owners (id, user_id, name, color)
          VALUES (${o.id}, ${userId}, ${o.name}, ${o.color})
        `;
      }

      // Insert budgets
      for (const b of state.budgets) {
        await sql`
          INSERT INTO budgets (id, user_id, category_id, month, "limit", owner_id, owner_splits)
          VALUES (${b.id}, ${userId}, ${b.categoryId}, ${b.month}, ${b.limit}, ${b.ownerId || null}, ${b.ownerSplits ? JSON.stringify(b.ownerSplits) : null})
        `;
      }

      // Insert expenses
      for (const e of state.expenses) {
        await sql`
          INSERT INTO expenses (id, user_id, category_id, date, description, amount, owner_id)
          VALUES (${e.id}, ${userId}, ${e.categoryId}, ${e.date}, ${e.description}, ${e.amount}, ${e.ownerId || null})
        `;
      }

      // Insert settings
      await sql`
        INSERT INTO settings (user_id, month_start_day, currency, default_owner_id)
        VALUES (${userId}, ${state.settings.monthStartDay}, ${state.settings.currency || "EUR"}, ${state.settings.defaultOwnerId || null})
      `;

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Sync POST error:", err);
      return res.status(500).json({ error: "Failed to save state" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
