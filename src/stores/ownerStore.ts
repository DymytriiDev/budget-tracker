import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Owner } from "@/types";
import { ownersApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

interface OwnerStore {
  owners: Owner[];
  addOwner: (owner: Omit<Owner, "id">) => void;
  updateOwner: (id: string, owner: Partial<Owner>) => void;
  deleteOwner: (id: string) => void;
}

export const useOwnerStore = create<OwnerStore>()(
  persist(
    (set, get) => ({
      owners: [],
      addOwner: (owner) => {
        const newOwner = { ...owner, id: crypto.randomUUID() };
        set((state) => ({
          owners: [...state.owners, newOwner],
        }));
        if (getAuthToken()) {
          ownersApi.create(newOwner).catch(() => {
            set((state) => ({
              owners: state.owners.filter((o) => o.id !== newOwner.id),
            }));
            toast.error("Failed to save owner");
          });
        }
      },
      updateOwner: (id, updates) => {
        const previous = get().owners.find((o) => o.id === id);
        set((state) => ({
          owners: state.owners.map((o) =>
            o.id === id ? { ...o, ...updates } : o,
          ),
        }));
        if (getAuthToken()) {
          ownersApi.update({ id, ...updates }).catch(() => {
            if (previous) {
              set((state) => ({
                owners: state.owners.map((o) => (o.id === id ? previous : o)),
              }));
            }
            toast.error("Failed to update owner");
          });
        }
      },
      deleteOwner: (id) => {
        const previous = get().owners.find((o) => o.id === id);
        set((state) => ({
          owners: state.owners.filter((o) => o.id !== id),
        }));
        if (getAuthToken()) {
          ownersApi.delete(id).catch(() => {
            if (previous) {
              set((state) => ({
                owners: [...state.owners, previous],
              }));
            }
            toast.error("Failed to delete owner");
          });
        }
      },
    }),
    { name: "budget-owners" },
  ),
);
