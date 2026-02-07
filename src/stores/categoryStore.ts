import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '@/types';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#22c55e' },
  { id: '2', name: 'Transportation', icon: 'Car', color: '#3b82f6' },
  { id: '3', name: 'Housing', icon: 'Home', color: '#f59e0b' },
  { id: '4', name: 'Entertainment', icon: 'Gamepad2', color: '#8b5cf6' },
  { id: '5', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: '6', name: 'Healthcare', icon: 'Heart', color: '#ef4444' },
  { id: '7', name: 'Utilities', icon: 'Zap', color: '#06b6d4' },
  { id: '8', name: 'Education', icon: 'GraduationCap', color: '#f97316' },
];

interface CategoryStore {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,
      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: crypto.randomUUID() },
          ],
        })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    { name: 'budget-categories' }
  )
);
