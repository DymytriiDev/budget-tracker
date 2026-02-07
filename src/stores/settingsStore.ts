import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  monthStartDay: number; // 1-28
  setMonthStartDay: (day: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      monthStartDay: 1,
      setMonthStartDay: (day) => set({ monthStartDay: Math.max(1, Math.min(28, day)) }),
    }),
    { name: 'budget-settings' }
  )
);
