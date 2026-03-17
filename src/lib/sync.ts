import { getAuthToken } from './auth';
import { useCategoryStore } from '@/stores/categoryStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useOwnerStore } from '@/stores/ownerStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface AppState {
  categories: { id: string; name: string; icon: string; color: string; description?: string }[];
  expenses: { id: string; categoryId: string; date: string; description: string; amount: number; ownerId?: string }[];
  budgets: { id: string; categoryId: string; month: string; limit: number; ownerId?: string; ownerSplits?: { ownerId: string; limit: number }[] }[];
  owners: { id: string; name: string; color: string }[];
  settings: { monthStartDay: number };
}

function collectState(): AppState {
  return {
    categories: useCategoryStore.getState().categories,
    expenses: useExpenseStore.getState().expenses,
    budgets: useBudgetStore.getState().budgets,
    owners: useOwnerStore.getState().owners,
    settings: { monthStartDay: useSettingsStore.getState().monthStartDay },
  };
}

function applyState(state: AppState) {
  if (state.categories) useCategoryStore.setState({ categories: state.categories });
  if (state.expenses) useExpenseStore.setState({ expenses: state.expenses });
  if (state.budgets) useBudgetStore.setState({ budgets: state.budgets });
  if (state.owners) useOwnerStore.setState({ owners: state.owners });
  if (state.settings) useSettingsStore.setState({ monthStartDay: state.settings.monthStartDay });
}

export async function fetchRemoteState(): Promise<AppState | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/sync', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data as AppState | null;
  } catch {
    return null;
  }
}

export async function pushRemoteState(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) {
    console.warn('[Sync] No auth token, skipping push');
    return false;
  }
  try {
    console.log('[Sync] Pushing state to remote...');
    const state = collectState();
    console.log('[Sync] State to push:', state);
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    console.log('[Sync] Push response:', res.status, res.ok);
    if (!res.ok) {
      const error = await res.text();
      console.error('[Sync] Push failed:', error);
    }
    return res.ok;
  } catch (err) {
    console.error('[Sync] Push error:', err);
    return false;
  }
}

export async function loadRemoteState(): Promise<boolean> {
  const remote = await fetchRemoteState();
  if (remote) {
    applyState(remote);
    return true;
  }
  return false;
}

// Debounced sync — call after any store change
let syncTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedPush() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    pushRemoteState();
  }, 500);
}

let unsubscribers: (() => void)[] = [];

export function startSyncListeners() {
  stopSyncListeners();
  unsubscribers = [
    useCategoryStore.subscribe(() => debouncedPush()),
    useExpenseStore.subscribe(() => debouncedPush()),
    useBudgetStore.subscribe(() => debouncedPush()),
    useOwnerStore.subscribe(() => debouncedPush()),
    useSettingsStore.subscribe(() => debouncedPush()),
  ];
}

export function stopSyncListeners() {
  unsubscribers.forEach((unsub) => unsub());
  unsubscribers = [];
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
}
