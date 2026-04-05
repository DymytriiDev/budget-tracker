import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Expense } from "@/types";
import { expensesApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesForMonth: (month: string) => Expense[];
  getExpensesForCategory: (categoryId: string) => Expense[];
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      addExpense: (expense) => {
        const newExpense = { ...expense, id: crypto.randomUUID() };
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
        if (getAuthToken()) {
          expensesApi.create(newExpense).catch(() => {
            set((state) => ({
              expenses: state.expenses.filter((e) => e.id !== newExpense.id),
            }));
            toast.error("Failed to save expense");
          });
        }
      },
      updateExpense: (id, updates) => {
        const previous = get().expenses.find((e) => e.id === id);
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e,
          ),
        }));
        if (getAuthToken()) {
          expensesApi.update({ id, ...updates }).catch(() => {
            if (previous) {
              set((state) => ({
                expenses: state.expenses.map((e) =>
                  e.id === id ? previous : e,
                ),
              }));
            }
            toast.error("Failed to update expense");
          });
        }
      },
      deleteExpense: (id) => {
        const previous = get().expenses.find((e) => e.id === id);
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
        if (getAuthToken()) {
          expensesApi.delete(id).catch(() => {
            if (previous) {
              set((state) => ({
                expenses: [...state.expenses, previous],
              }));
            }
            toast.error("Failed to delete expense");
          });
        }
      },
      getExpensesForMonth: (month) =>
        get().expenses.filter((e) => e.date.startsWith(month)),
      getExpensesForCategory: (categoryId) =>
        get().expenses.filter((e) => e.categoryId === categoryId),
    }),
    { name: "budget-expenses" },
  ),
);
