export function getToken(req: any): string | null {
  const auth = req.headers?.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

export function unauthorized(res: any) {
  return res.status(401).json({ error: 'Unauthorized' });
}

export function getDbConfig() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  return connectionString;
}
