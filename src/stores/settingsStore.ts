import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  monthStartDay: number; // 1-28
  defaultOwnerId?: string;
  currency: string; // ISO 4217 currency code
  setMonthStartDay: (day: number) => void;
  setDefaultOwnerId: (ownerId: string | undefined) => void;
  setCurrency: (currency: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      monthStartDay: 1,
      defaultOwnerId: undefined,
      currency: 'EUR',
      setMonthStartDay: (day) => set({ monthStartDay: Math.max(1, Math.min(28, day)) }),
      setDefaultOwnerId: (ownerId) => set({ defaultOwnerId: ownerId }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'budget-settings' }
  )
);
