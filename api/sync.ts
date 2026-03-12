import { put, list } from '@vercel/blob';

const BLOB_KEY = 'budget-state.json';

function getToken(req: any): string | null {
  const auth = req.headers?.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

function unauthorized(res: any) {
  return res.status(401).json({ error: 'Unauthorized' });
}

export default async function handler(req: any, res: any) {
  const token = getToken(req);
  if (!token || token !== process.env.AUTH_TOKEN) {
    return unauthorized(res);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set');
    return res.status(500).json({ error: 'Server configuration error: BLOB_READ_WRITE_TOKEN missing' });
  }

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY });
      if (blobs.length === 0) {
        return res.status(200).json({ data: null });
      }
      const response = await fetch(blobs[0].url);
      const data = await response.json();
      return res.status(200).json({ data });
    } catch (err) {
      console.error('Sync GET error:', err);
      return res.status(500).json({ error: 'Failed to read state' });
    }
  }

  if (req.method === 'POST') {
    try {
      await put(BLOB_KEY, JSON.stringify(req.body), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        allowOverwrite: true,
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Sync POST error:', err);
      return res.status(500).json({ error: 'Failed to save state' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
