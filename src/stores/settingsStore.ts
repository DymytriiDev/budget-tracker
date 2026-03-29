import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  monthStartDay: number; // 1-28
  defaultOwnerId?: string;
  setMonthStartDay: (day: number) => void;
  setDefaultOwnerId: (ownerId: string | undefined) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      monthStartDay: 1,
      defaultOwnerId: undefined,
      setMonthStartDay: (day) => set({ monthStartDay: Math.max(1, Math.min(28, day)) }),
      setDefaultOwnerId: (ownerId) => set({ defaultOwnerId: ownerId }),
    }),
    { name: 'budget-settings' }
  )
);
