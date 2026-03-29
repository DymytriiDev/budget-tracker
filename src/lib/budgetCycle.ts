import { format, subMonths } from 'date-fns';

/**
 * Gets the budget cycle identifier for a given date and month start day.
 * For example, with monthStartDay = 25:
 * - Jan 25 - Feb 24 = "2024-01"
 * - Feb 25 - Mar 24 = "2024-02"
 */
export function getBudgetCycleMonth(date: Date, monthStartDay: number): string {
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth();

  // If current day is before the start day, we're in the previous month's cycle
  if (day < monthStartDay) {
    const prevMonth = new Date(year, month - 1, 1);
    return format(prevMonth, 'yyyy-MM');
  }

  // Otherwise, we're in the current month's cycle
  return format(date, 'yyyy-MM');
}

/**
 * Gets the date range for a budget cycle given a cycle identifier and month start day.
 * Returns [startDate, endDate] inclusive.
 */
export function getBudgetCycleDateRange(
  cycleMonth: string,
  monthStartDay: number
): [Date, Date] {
  const [year, month] = cycleMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, monthStartDay);
  
  // End date is the day before the next cycle starts
  const nextCycleStart = new Date(year, month, monthStartDay);
  const endDate = new Date(nextCycleStart.getTime() - 24 * 60 * 60 * 1000);
  
  return [startDate, endDate];
}

/**
 * Checks if an expense date falls within a budget cycle.
 */
export function isExpenseInCycle(
  expenseDate: string,
  cycleMonth: string,
  monthStartDay: number
): boolean {
  const date = new Date(expenseDate);
  const cycle = getBudgetCycleMonth(date, monthStartDay);
  return cycle === cycleMonth;
}

/**
 * Gets the last 6 budget cycles from a given date.
 */
export function getLast6BudgetCycles(date: Date, monthStartDay: number): string[] {
  const cycles: string[] = [];
  let currentDate = date;
  
  for (let i = 0; i < 6; i++) {
    cycles.unshift(getBudgetCycleMonth(currentDate, monthStartDay));
    currentDate = subMonths(currentDate, 1);
  }
  
  return cycles;
}

/**
 * Gets a user-friendly display label for a budget cycle.
 * If monthStartDay > 20, displays the next month's name for better UX.
 * For example, with monthStartDay = 25:
 * - Cycle "2024-01" (Jan 25 - Feb 24) displays as "February 2024"
 * - Cycle "2024-02" (Feb 25 - Mar 24) displays as "March 2024"
 */
export function getBudgetCycleDisplayLabel(date: Date, monthStartDay: number): string {
  const cycleMonth = getBudgetCycleMonth(date, monthStartDay);
  const [year, month] = cycleMonth.split('-').map(Number);
  
  // If monthStartDay > 20, show the next month for better UX
  if (monthStartDay > 20) {
    const displayDate = new Date(year, month, 1); // This gives us the next month
    return format(displayDate, 'MMMM yyyy');
  }
  
  // Otherwise, show the current month
  const displayDate = new Date(year, month - 1, 1);
  return format(displayDate, 'MMMM yyyy');
}
