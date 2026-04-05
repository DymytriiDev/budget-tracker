import { getAuthToken } from './auth';
import type { Category, Expense, Budget, Owner } from '@/types';

const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

// Categories API
export const categoriesApi = {
  list: () => request<{ data: Category[] }>('/categories').then((r) => r.data),

  create: (category: Category) =>
    request<{ ok: boolean }>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  update: (category: Partial<Category> & { id: string }) =>
    request<{ ok: boolean }>('/categories', {
      method: 'PUT',
      body: JSON.stringify(category),
    }),

  delete: (id: string) =>
    request<{ ok: boolean }>(`/categories?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  reorder: (order: string[]) =>
    request<{ ok: boolean }>('/categories', {
      method: 'PATCH',
      body: JSON.stringify({ order }),
    }),
};

// Expenses API
export const expensesApi = {
  list: () => request<{ data: Expense[] }>('/expenses').then((r) => r.data),

  create: (expense: Expense) =>
    request<{ ok: boolean }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),

  update: (expense: Partial<Expense> & { id: string }) =>
    request<{ ok: boolean }>('/expenses', {
      method: 'PUT',
      body: JSON.stringify(expense),
    }),

  delete: (id: string) =>
    request<{ ok: boolean }>(`/expenses?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

// Budgets API
export const budgetsApi = {
  list: () => request<{ data: Budget[] }>('/budgets').then((r) => r.data),

  create: (budget: Budget) =>
    request<{ ok: boolean }>('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    }),

  update: (budget: Partial<Budget> & { id: string }) =>
    request<{ ok: boolean }>('/budgets', {
      method: 'PUT',
      body: JSON.stringify(budget),
    }),

  delete: (id: string) =>
    request<{ ok: boolean }>(`/budgets?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

// Owners API
export const ownersApi = {
  list: () => request<{ data: Owner[] }>('/owners').then((r) => r.data),

  create: (owner: Owner) =>
    request<{ ok: boolean }>('/owners', {
      method: 'POST',
      body: JSON.stringify(owner),
    }),

  update: (owner: Partial<Owner> & { id: string }) =>
    request<{ ok: boolean }>('/owners', {
      method: 'PUT',
      body: JSON.stringify(owner),
    }),

  delete: (id: string) =>
    request<{ ok: boolean }>(`/owners?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

// Settings API
export const settingsApi = {
  get: () =>
    request<{ data: { monthStartDay: number; currency: string; defaultOwnerId?: string } }>(
      '/settings'
    ).then((r) => r.data),

  update: (settings: { monthStartDay?: number; currency?: string; defaultOwnerId?: string }) =>
    request<{ ok: boolean }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
