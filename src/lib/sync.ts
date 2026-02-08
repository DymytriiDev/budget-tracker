import { getAuthToken } from './auth';
import { useCategoryStore } from '@/stores/categoryStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface AppState {
  categories: { id: string; name: string; icon: string; color: string }[];
  expenses: { id: string; categoryId: string; date: string; description: string; amount: number }[];
  budgets: { id: string; categoryId: string; month: string; limit: number }[];
  settings: { monthStartDay: number };
}

function collectState(): AppState {
  return {
    categories: useCategoryStore.getState().categories,
    expenses: useExpenseStore.getState().expenses,
    budgets: useBudgetStore.getState().budgets,
    settings: { monthStartDay: useSettingsStore.getState().monthStartDay },
  };
}

function applyState(state: AppState) {
  if (state.categories) useCategoryStore.setState({ categories: state.categories });
  if (state.expenses) useExpenseStore.setState({ expenses: state.expenses });
  if (state.budgets) useBudgetStore.setState({ budgets: state.budgets });
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
  if (!token) return false;
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collectState()),
    });
    return res.ok;
  } catch {
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
  }, 1500);
}

let unsubscribers: (() => void)[] = [];

export function startSyncListeners() {
  stopSyncListeners();
  unsubscribers = [
    useCategoryStore.subscribe(() => debouncedPush()),
    useExpenseStore.subscribe(() => debouncedPush()),
    useBudgetStore.subscribe(() => debouncedPush()),
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
