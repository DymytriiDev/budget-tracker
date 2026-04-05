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

  // GET - List all budgets
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, category_id, month, "limit", owner_id, owner_splits 
        FROM budgets 
        WHERE user_id = ${userId}
      `;
      const budgets = rows.map((b: any) => ({
        id: b.id,
        categoryId: b.category_id,
        month: b.month,
        limit: b.limit,
        ownerId: b.owner_id,
        ownerSplits: b.owner_splits,
      }));
      return res.status(200).json({ data: budgets });
    } catch (err) {
      console.error('Budgets GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch budgets' });
    }
  }

  // POST - Create or update a budget (upsert by categoryId + month)
  if (req.method === 'POST') {
    try {
      const { id, categoryId, month, limit, ownerId, ownerSplits } = req.body;
      if (!id || !categoryId || !month || limit === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if budget exists for this category/month
      const existing = await sql`
        SELECT id FROM budgets 
        WHERE user_id = ${userId} AND category_id = ${categoryId} AND month = ${month}
      `;

      if (existing.length > 0) {
        // Update existing
        await sql`
          UPDATE budgets 
          SET "limit" = ${limit}, owner_id = ${ownerId || null}, owner_splits = ${ownerSplits ? JSON.stringify(ownerSplits) : null}
          WHERE id = ${existing[0].id} AND user_id = ${userId}
        `;
      } else {
        // Insert new
        await sql`
          INSERT INTO budgets (id, user_id, category_id, month, "limit", owner_id, owner_splits)
          VALUES (${id}, ${userId}, ${categoryId}, ${month}, ${limit}, ${ownerId || null}, ${ownerSplits ? JSON.stringify(ownerSplits) : null})
        `;
      }
      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error('Budgets POST error:', err);
      return res.status(500).json({ error: 'Failed to create/update budget' });
    }
  }

  // PUT - Update a budget
  if (req.method === 'PUT') {
    try {
      const { id, limit, ownerId, ownerSplits } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await sql`
        UPDATE budgets 
        SET "limit" = COALESCE(${limit}, "limit"),
            owner_id = ${ownerId},
            owner_splits = ${ownerSplits ? JSON.stringify(ownerSplits) : null}
        WHERE id = ${id} AND user_id = ${userId}
      `;
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Budgets PUT error:', err);
      return res.status(500).json({ error: 'Failed to update budget' });
    }
  }

  // DELETE - Delete a budget
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await sql`DELETE FROM budgets WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Budgets DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete budget' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
