import { neon } from '@neondatabase/serverless';
import { ensureTables } from '../src/db/migrate';
import { getToken, unauthorized, getDbConfig } from './_utils/auth';

export default async function handler(req: any, res: any) {
  const token = getToken(req);
  if (!token || token !== process.env.AUTH_TOKEN) {
    return unauthorized(res);
  }

  const connectionString = getDbConfig();
  if (!connectionString) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    await ensureTables();
  } catch (err) {
    console.error('Migration error:', err);
    return res.status(500).json({ error: 'Database migration failed' });
  }

  const sql = neon(connectionString);
  const userId = token;

  // GET - List all expenses
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, category_id, date, description, amount, owner_id 
        FROM expenses 
        WHERE user_id = ${userId}
        ORDER BY date DESC
      `;
      const expenses = rows.map((e: any) => ({
        id: e.id,
        categoryId: e.category_id,
        date: e.date,
        description: e.description,
        amount: e.amount,
        ownerId: e.owner_id,
      }));
      return res.status(200).json({ data: expenses });
    } catch (err) {
      console.error('Expenses GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  }

  // POST - Create a new expense
  if (req.method === 'POST') {
    try {
      const { id, categoryId, date, description, amount, ownerId } = req.body;
      if (!id || !categoryId || !date || !description || amount === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await sql`
        INSERT INTO expenses (id, user_id, category_id, date, description, amount, owner_id)
        VALUES (${id}, ${userId}, ${categoryId}, ${date}, ${description}, ${amount}, ${ownerId || null})
      `;
      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error('Expenses POST error:', err);
      return res.status(500).json({ error: 'Failed to create expense' });
    }
  }

  // PUT - Update an expense
  if (req.method === 'PUT') {
    try {
      const { id, categoryId, date, description, amount, ownerId } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await sql`
        UPDATE expenses 
        SET category_id = COALESCE(${categoryId}, category_id),
            date = COALESCE(${date}, date),
            description = COALESCE(${description}, description),
            amount = COALESCE(${amount}, amount),
            owner_id = ${ownerId}
        WHERE id = ${id} AND user_id = ${userId}
      `;
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Expenses PUT error:', err);
      return res.status(500).json({ error: 'Failed to update expense' });
    }
  }

  // DELETE - Delete an expense
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await sql`DELETE FROM expenses WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Expenses DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete expense' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
