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

  // GET - Get settings
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT month_start_day, currency, default_owner_id 
        FROM settings 
        WHERE user_id = ${userId}
      `;
      const settings = rows[0] || { month_start_day: 1, currency: 'EUR', default_owner_id: null };
      return res.status(200).json({
        data: {
          monthStartDay: settings.month_start_day,
          currency: settings.currency || 'EUR',
          defaultOwnerId: settings.default_owner_id,
        },
      });
    } catch (err) {
      console.error('Settings GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  // PUT - Update settings (upsert)
  if (req.method === 'PUT') {
    try {
      const { monthStartDay, currency, defaultOwnerId } = req.body;

      // Check if settings exist
      const existing = await sql`SELECT user_id FROM settings WHERE user_id = ${userId}`;

      if (existing.length > 0) {
        await sql`
          UPDATE settings 
          SET month_start_day = COALESCE(${monthStartDay}, month_start_day),
              currency = COALESCE(${currency}, currency),
              default_owner_id = ${defaultOwnerId}
          WHERE user_id = ${userId}
        `;
      } else {
        await sql`
          INSERT INTO settings (user_id, month_start_day, currency, default_owner_id)
          VALUES (${userId}, ${monthStartDay || 1}, ${currency || 'EUR'}, ${defaultOwnerId || null})
        `;
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Settings PUT error:', err);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
