import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense } from '@/types';

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesForMonth: (month: string) => Expense[];
  getExpensesForCategory: (categoryId: string) => Expense[];
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            { ...expense, id: crypto.randomUUID() },
          ],
        })),
      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
      getExpensesForMonth: (month) =>
        get().expenses.filter((e) => e.date.startsWith(month)),
      getExpensesForCategory: (categoryId) =>
        get().expenses.filter((e) => e.categoryId === categoryId),
    }),
    { name: 'budget-expenses' }
  )
);
