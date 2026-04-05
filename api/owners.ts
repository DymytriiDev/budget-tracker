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

  // GET - List all owners
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, name, color 
        FROM owners 
        WHERE user_id = ${userId}
      `;
      const owners = rows.map((o: any) => ({
        id: o.id,
        name: o.name,
        color: o.color,
      }));
      return res.status(200).json({ data: owners });
    } catch (err) {
      console.error('Owners GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch owners' });
    }
  }

  // POST - Create a new owner
  if (req.method === 'POST') {
    try {
      const { id, name, color } = req.body;
      if (!id || !name || !color) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await sql`
        INSERT INTO owners (id, user_id, name, color)
        VALUES (${id}, ${userId}, ${name}, ${color})
      `;
      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error('Owners POST error:', err);
      return res.status(500).json({ error: 'Failed to create owner' });
    }
  }

  // PUT - Update an owner
  if (req.method === 'PUT') {
    try {
      const { id, name, color } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await sql`
        UPDATE owners 
        SET name = COALESCE(${name}, name),
            color = COALESCE(${color}, color)
        WHERE id = ${id} AND user_id = ${userId}
      `;
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Owners PUT error:', err);
      return res.status(500).json({ error: 'Failed to update owner' });
    }
  }

  // DELETE - Delete an owner
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await sql`DELETE FROM owners WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Owners DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete owner' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
