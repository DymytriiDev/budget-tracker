import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Budget } from "@/types";
import { budgetsApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

interface BudgetStore {
  budgets: Budget[];
  setBudget: (
    categoryId: string,
    month: string,
    limit: number,
    ownerId?: string,
    ownerSplits?: { ownerId: string; limit: number }[],
  ) => void;
  getBudget: (categoryId: string, month: string) => Budget | undefined;
  deleteBudget: (id: string) => void;
  getBudgetsForMonth: (month: string) => Budget[];
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],
      setBudget: (categoryId, month, limit, ownerId, ownerSplits) => {
        const existing = get().budgets.find(
          (b) => b.categoryId === categoryId && b.month === month,
        );
        const previousBudgets = get().budgets;
        const budgetData = {
          id: existing?.id || crypto.randomUUID(),
          categoryId,
          month,
          limit,
          ownerId,
          ownerSplits,
        };

        set((state) => {
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.id === existing.id
                  ? { ...b, limit, ownerId, ownerSplits }
                  : b,
              ),
            };
          }
          return {
            budgets: [...state.budgets, budgetData],
          };
        });

        if (getAuthToken()) {
          budgetsApi.create(budgetData).catch(() => {
            set({ budgets: previousBudgets });
            toast.error("Failed to save budget");
          });
        }
      },
      getBudget: (categoryId, month) =>
        get().budgets.find(
          (b) => b.categoryId === categoryId && b.month === month,
        ),
      deleteBudget: (id) => {
        const previous = get().budgets.find((b) => b.id === id);
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
        if (getAuthToken()) {
          budgetsApi.delete(id).catch(() => {
            if (previous) {
              set((state) => ({
                budgets: [...state.budgets, previous],
              }));
            }
            toast.error("Failed to delete budget");
          });
        }
      },
      getBudgetsForMonth: (month) =>
        get().budgets.filter((b) => b.month === month),
    }),
    { name: "budget-budgets" },
  ),
);
