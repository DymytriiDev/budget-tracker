import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Category } from "@/types";
import { categoriesApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

interface CategoryStore {
  categories: Category[];
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],
      addCategory: (category) => {
        const newCategory = { ...category, id: crypto.randomUUID() };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
        if (getAuthToken()) {
          categoriesApi.create(newCategory).catch(() => {
            set((state) => ({
              categories: state.categories.filter(
                (c) => c.id !== newCategory.id,
              ),
            }));
            toast.error("Failed to save category");
          });
        }
      },
      updateCategory: (id, updates) => {
        const previous = get().categories.find((c) => c.id === id);
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        }));
        if (getAuthToken()) {
          categoriesApi.update({ id, ...updates }).catch(() => {
            if (previous) {
              set((state) => ({
                categories: state.categories.map((c) =>
                  c.id === id ? previous : c,
                ),
              }));
            }
            toast.error("Failed to update category");
          });
        }
      },
      deleteCategory: (id) => {
        const previous = get().categories.find((c) => c.id === id);
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        if (getAuthToken()) {
          categoriesApi.delete(id).catch(() => {
            if (previous) {
              set((state) => ({
                categories: [...state.categories, previous],
              }));
            }
            toast.error("Failed to delete category");
          });
        }
      },
      reorderCategories: (categories) => {
        const previous = get().categories;
        set({ categories });
        if (getAuthToken()) {
          categoriesApi.reorder(categories.map((c) => c.id)).catch(() => {
            set({ categories: previous });
            toast.error("Failed to reorder categories");
          });
        }
      },
    }),
    { name: "budget-categories" },
  ),
);
