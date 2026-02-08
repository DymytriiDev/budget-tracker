const AUTH_KEY = 'budget_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isLocalDev(): boolean {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

export function extractTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    // Clean URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.pathname + url.search);
  }
  return token;
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/sync', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status === 200;
  } catch {
    // API unreachable — can't validate
    return false;
  }
}
