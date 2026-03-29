import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMonths, subMonths } from "@/lib/date";
import { getBudgetCycleDisplayLabel } from "@/lib/budgetCycle";
import { useSettingsStore } from "@/stores/settingsStore";

interface MonthNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function MonthNavigation({ currentDate, onDateChange }: MonthNavigationProps) {
  const { monthStartDay } = useSettingsStore();

  return (
    <nav className="flex items-center gap-2" aria-label="Month navigation">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(subMonths(currentDate, 1))}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span
        className="min-w-[130px] text-center font-semibold text-sm"
        aria-live="polite"
      >
        {getBudgetCycleDisplayLabel(currentDate, monthStartDay)}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(addMonths(currentDate, 1))}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
