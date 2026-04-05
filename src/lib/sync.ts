import { getAuthToken } from "./auth";
import { useCategoryStore } from "@/stores/categoryStore";
import { useBudgetStore } from "@/stores/budgetStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { useOwnerStore } from "@/stores/ownerStore";
import { useSettingsStore } from "@/stores/settingsStore";

interface AppState {
  categories: {
    id: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
  }[];
  expenses: {
    id: string;
    categoryId: string;
    date: string;
    description: string;
    amount: number;
    ownerId?: string;
  }[];
  budgets: {
    id: string;
    categoryId: string;
    month: string;
    limit: number;
    ownerId?: string;
    ownerSplits?: { ownerId: string; limit: number }[];
  }[];
  owners: { id: string; name: string; color: string }[];
  settings: {
    monthStartDay: number;
    currency?: string;
    defaultOwnerId?: string;
  };
}

function applyState(state: AppState) {
  if (state.categories)
    useCategoryStore.setState({ categories: state.categories });
  if (state.expenses) useExpenseStore.setState({ expenses: state.expenses });
  if (state.budgets) useBudgetStore.setState({ budgets: state.budgets });
  if (state.owners) useOwnerStore.setState({ owners: state.owners });
  if (state.settings) {
    useSettingsStore.setState({
      monthStartDay: state.settings.monthStartDay,
      currency: state.settings.currency || "EUR",
      defaultOwnerId: state.settings.defaultOwnerId,
    });
  }
}

export async function fetchRemoteState(): Promise<AppState | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/sync", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data as AppState | null;
  } catch {
    return null;
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
