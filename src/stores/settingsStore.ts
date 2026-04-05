import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

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
    (set, get) => ({
      monthStartDay: 1,
      defaultOwnerId: undefined,
      currency: "EUR",
      setMonthStartDay: (day) => {
        const previous = get().monthStartDay;
        const monthStartDay = Math.max(1, Math.min(28, day));
        set({ monthStartDay });
        if (getAuthToken()) {
          settingsApi.update({ monthStartDay }).catch(() => {
            set({ monthStartDay: previous });
            toast.error("Failed to save settings");
          });
        }
      },
      setDefaultOwnerId: (defaultOwnerId) => {
        const previous = get().defaultOwnerId;
        set({ defaultOwnerId });
        if (getAuthToken()) {
          settingsApi.update({ defaultOwnerId }).catch(() => {
            set({ defaultOwnerId: previous });
            toast.error("Failed to save settings");
          });
        }
      },
      setCurrency: (currency) => {
        const previous = get().currency;
        set({ currency });
        if (getAuthToken()) {
          settingsApi.update({ currency }).catch(() => {
            set({ currency: previous });
            toast.error("Failed to save settings");
          });
        }
      },
    }),
    { name: "budget-settings" },
  ),
);
