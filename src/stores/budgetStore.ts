import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Budget } from '@/types';

interface BudgetStore {
  budgets: Budget[];
  setBudget: (categoryId: string, month: string, limit: number, ownerId?: string, ownerSplits?: { ownerId: string; limit: number }[]) => void;
  getBudget: (categoryId: string, month: string) => Budget | undefined;
  deleteBudget: (id: string) => void;
  getBudgetsForMonth: (month: string) => Budget[];
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],
      setBudget: (categoryId, month, limit, ownerId, ownerSplits) =>
        set((state) => {
          const existing = state.budgets.find(
            (b) => b.categoryId === categoryId && b.month === month
          );
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.id === existing.id ? { ...b, limit, ownerId, ownerSplits } : b
              ),
            };
          }
          return {
            budgets: [
              ...state.budgets,
              { id: crypto.randomUUID(), categoryId, month, limit, ownerId, ownerSplits },
            ],
          };
        }),
      getBudget: (categoryId, month) =>
        get().budgets.find(
          (b) => b.categoryId === categoryId && b.month === month
        ),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
      getBudgetsForMonth: (month) =>
        get().budgets.filter((b) => b.month === month),
    }),
    { name: 'budget-budgets' }
  )
);
