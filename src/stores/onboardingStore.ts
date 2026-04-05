import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingStep = 
  | 'settings'
  | 'categories'
  | 'budgets'
  | 'owners'
  | 'complete';

interface OnboardingStore {
  isCompleted: boolean;
  currentStep: OnboardingStep;
  skippedSteps: OnboardingStep[];
  setCurrentStep: (step: OnboardingStep) => void;
  skipStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'settings',
  'categories',
  'budgets',
  'owners',
  'complete',
];

export const STEP_LABELS: Record<OnboardingStep, string> = {
  settings: 'Settings',
  categories: 'Categories',
  budgets: 'Budgets',
  owners: 'Owners',
  complete: 'Get Started',
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      isCompleted: false,
      currentStep: 'settings',
      skippedSteps: [],
      setCurrentStep: (step) => set({ currentStep: step }),
      skipStep: (step) =>
        set((state) => ({
          skippedSteps: state.skippedSteps.includes(step)
            ? state.skippedSteps
            : [...state.skippedSteps, step],
        })),
      completeOnboarding: () => set({ isCompleted: true }),
      resetOnboarding: () =>
        set({
          isCompleted: false,
          currentStep: 'settings',
          skippedSteps: [],
        }),
    }),
    { name: 'budget-onboarding' }
  )
);
