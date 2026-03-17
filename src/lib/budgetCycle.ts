import { format, subMonths, parse } from 'date-fns';

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
  const date = parse(expenseDate, 'yyyy-MM-dd', new Date());
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
