import { useCallback } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useOnboardingStore,
  ONBOARDING_STEPS,
  STEP_LABELS,
  type OnboardingStep,
} from '@/stores/onboardingStore';
import { SettingsStep } from './steps/SettingsStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { BudgetsStep } from './steps/BudgetsStep';
import { OwnersStep } from './steps/OwnersStep';
import { CompleteStep } from './steps/CompleteStep';

export function OnboardingWizard() {
  const { currentStep, setCurrentStep, skippedSteps } = useOnboardingStore();

  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(ONBOARDING_STEPS[nextIndex]);
    }
  }, [currentIndex, setCurrentStep]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(ONBOARDING_STEPS[prevIndex]);
    }
  }, [currentIndex, setCurrentStep]);

  const isStepCompleted = (step: OnboardingStep) => {
    const stepIndex = ONBOARDING_STEPS.indexOf(step);
    return stepIndex < currentIndex || skippedSteps.includes(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'settings':
        return <SettingsStep onNext={goToNext} />;
      case 'categories':
        return <CategoriesStep onNext={goToNext} onBack={goToPrevious} />;
      case 'budgets':
        return <BudgetsStep onNext={goToNext} onBack={goToPrevious} />;
      case 'owners':
        return <OwnersStep onNext={goToNext} onBack={goToPrevious} />;
      case 'complete':
        return <CompleteStep onBack={goToPrevious} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress Bar */}
      <div className="border-b bg-card/50 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            {ONBOARDING_STEPS.map((step, index) => {
              const isActive = step === currentStep;
              const isCompleted = isStepCompleted(step);
              const isSkipped = skippedSteps.includes(step);

              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                        isActive &&
                          'border-primary bg-primary text-primary-foreground',
                        isCompleted &&
                          !isActive &&
                          'border-primary bg-primary/10 text-primary',
                        !isActive &&
                          !isCompleted &&
                          'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      {isCompleted && !isActive ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-xs font-medium',
                        isActive && 'text-primary',
                        isSkipped && 'text-muted-foreground',
                        !isActive && !isSkipped && 'text-muted-foreground'
                      )}
                    >
                      {STEP_LABELS[step]}
                      {isSkipped && ' (skipped)'}
                    </span>
                  </div>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 flex-1',
                        isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
