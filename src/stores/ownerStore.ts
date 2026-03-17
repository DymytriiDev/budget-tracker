import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Owner } from "@/types";

interface OwnerStore {
  owners: Owner[];
  addOwner: (owner: Omit<Owner, "id">) => void;
  updateOwner: (id: string, owner: Partial<Owner>) => void;
  deleteOwner: (id: string) => void;
}

export const useOwnerStore = create<OwnerStore>()(
  persist(
    (set) => ({
      owners: [],
      addOwner: (owner) =>
        set((state) => ({
          owners: [
            ...state.owners,
            { ...owner, id: crypto.randomUUID() },
          ],
        })),
      updateOwner: (id, updates) =>
        set((state) => ({
          owners: state.owners.map((o) =>
            o.id === id ? { ...o, ...updates } : o,
          ),
        })),
      deleteOwner: (id) =>
        set((state) => ({
          owners: state.owners.filter((o) => o.id !== id),
        })),
    }),
    { name: "budget-owners" },
  ),
);
