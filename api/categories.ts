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

  // GET - List all categories
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, name, icon, color, description, sort_order 
        FROM categories 
        WHERE user_id = ${userId} 
        ORDER BY sort_order
      `;
      const categories = rows.map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        description: c.description,
      }));
      return res.status(200).json({ data: categories });
    } catch (err) {
      console.error('Categories GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  // POST - Create a new category
  if (req.method === 'POST') {
    try {
      const { id, name, icon, color, description } = req.body;
      if (!id || !name || !icon || !color) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get max sort_order
      const maxResult = await sql`
        SELECT COALESCE(MAX(sort_order), -1) as max_order 
        FROM categories 
        WHERE user_id = ${userId}
      `;
      const sortOrder = (maxResult[0]?.max_order ?? -1) + 1;

      await sql`
        INSERT INTO categories (id, user_id, name, icon, color, description, sort_order)
        VALUES (${id}, ${userId}, ${name}, ${icon}, ${color}, ${description || null}, ${sortOrder})
      `;
      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error('Categories POST error:', err);
      return res.status(500).json({ error: 'Failed to create category' });
    }
  }

  // PUT - Update a category
  if (req.method === 'PUT') {
    try {
      const { id, name, icon, color, description } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await sql`
        UPDATE categories 
        SET name = COALESCE(${name}, name),
            icon = COALESCE(${icon}, icon),
            color = COALESCE(${color}, color),
            description = ${description}
        WHERE id = ${id} AND user_id = ${userId}
      `;
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Categories PUT error:', err);
      return res.status(500).json({ error: 'Failed to update category' });
    }
  }

  // DELETE - Delete a category
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await sql`DELETE FROM categories WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Categories DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete category' });
    }
  }

  // PATCH - Reorder categories
  if (req.method === 'PATCH') {
    try {
      const { order } = req.body; // Array of category IDs in new order
      if (!Array.isArray(order)) {
        return res.status(400).json({ error: 'Missing order array' });
      }

      for (let i = 0; i < order.length; i++) {
        await sql`
          UPDATE categories 
          SET sort_order = ${i} 
          WHERE id = ${order[i]} AND user_id = ${userId}
        `;
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Categories PATCH error:', err);
      return res.status(500).json({ error: 'Failed to reorder categories' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
