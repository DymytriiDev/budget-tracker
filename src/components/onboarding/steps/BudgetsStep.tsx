import { useState } from 'react';
import { ArrowLeft, ArrowRight, PiggyBank } from 'lucide-react';
import { useCategoryStore } from '@/stores/categoryStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getIcon } from '@/lib/icons';
import { normalizeCurrencyInput } from '@/lib/currency';

interface BudgetsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function BudgetsStep({ onNext, onBack }: BudgetsStepProps) {
  const { categories } = useCategoryStore();
  const { setBudget } = useBudgetStore();
  const { skipStep } = useOnboardingStore();
  const [budgetValues, setBudgetValues] = useState<Record<string, string>>({});

  const currentMonth = new Date().toISOString().slice(0, 7);

  const handleBudgetChange = (categoryId: string, value: string) => {
    const normalized = normalizeCurrencyInput(value);
    if (normalized !== null) {
      setBudgetValues((prev) => ({ ...prev, [categoryId]: normalized }));
    }
  };

  const handleSaveAndContinue = () => {
    Object.entries(budgetValues).forEach(([categoryId, value]) => {
      const amount = parseFloat(value);
      if (!isNaN(amount) && amount > 0) {
        setBudget(categoryId, currentMonth, amount);
      }
    });
    onNext();
  };

  const handleSkip = () => {
    skipStep('budgets');
    onNext();
  };

  const hasBudgets = Object.values(budgetValues).some((v) => {
    const num = parseFloat(v);
    return !isNaN(num) && num > 0;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <PiggyBank className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Set Monthly Budgets</h1>
        <p className="mt-2 text-muted-foreground">
          Define spending limits for each category (optional)
        </p>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-muted-foreground">
              No categories to set budgets for. Go back to add categories first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            return (
              <Card key={cat.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <span className="flex-1 truncate font-medium">{cat.name}</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={budgetValues[cat.id] || ''}
                    onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                    className="h-10 w-28 text-right tabular-nums"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSkip} variant="outline">
            Skip
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            className="gap-2"
            disabled={!hasBudgets && categories.length > 0}
          >
            {hasBudgets ? 'Save & Continue' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
