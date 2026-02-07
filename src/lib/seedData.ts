import { format, subMonths, subDays } from 'date-fns';
import { useCategoryStore } from '@/stores/categoryStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useExpenseStore } from '@/stores/expenseStore';

export function seedIfEmpty() {
  const categories = useCategoryStore.getState().categories;
  const expenses = useExpenseStore.getState().expenses;
  const budgets = useBudgetStore.getState().budgets;

  if (expenses.length > 0 || budgets.length > 0) return;

  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const lastMonth = format(subMonths(now, 1), 'yyyy-MM');
  const twoMonthsAgo = format(subMonths(now, 2), 'yyyy-MM');
  const threeMonthsAgo = format(subMonths(now, 3), 'yyyy-MM');

  const catMap: Record<string, string> = {};
  categories.forEach((c) => {
    catMap[c.name] = c.id;
  });

  const { setBudget } = useBudgetStore.getState();
  const { addExpense } = useExpenseStore.getState();

  // Set budgets for current and past months
  const budgetLimits: [string, number][] = [
    ['Food & Dining', 600],
    ['Transportation', 300],
    ['Housing', 1500],
    ['Entertainment', 200],
    ['Shopping', 400],
    ['Healthcare', 150],
    ['Utilities', 250],
    ['Education', 100],
  ];

  [currentMonth, lastMonth, twoMonthsAgo, threeMonthsAgo].forEach((month) => {
    budgetLimits.forEach(([name, limit]) => {
      if (catMap[name]) {
        setBudget(catMap[name], month, limit);
      }
    });
  });

  // Seed expenses for current month
  const currentExpenses: [string, string, number, number][] = [
    ['Food & Dining', 'Grocery store', 85.50, 2],
    ['Food & Dining', 'Restaurant dinner', 62.30, 5],
    ['Food & Dining', 'Coffee shop', 12.75, 1],
    ['Food & Dining', 'Lunch takeout', 18.90, 3],
    ['Transportation', 'Gas station', 55.00, 4],
    ['Transportation', 'Parking fee', 15.00, 6],
    ['Transportation', 'Uber ride', 24.50, 2],
    ['Housing', 'Monthly rent', 1200.00, 1],
    ['Housing', 'Home repairs', 85.00, 8],
    ['Entertainment', 'Movie tickets', 32.00, 7],
    ['Entertainment', 'Streaming subscription', 15.99, 1],
    ['Entertainment', 'Concert tickets', 75.00, 3],
    ['Shopping', 'New jacket', 89.99, 5],
    ['Shopping', 'Electronics', 149.99, 2],
    ['Shopping', 'Books', 34.50, 6],
    ['Healthcare', 'Pharmacy', 28.50, 4],
    ['Healthcare', 'Doctor visit copay', 40.00, 7],
    ['Utilities', 'Electric bill', 95.00, 3],
    ['Utilities', 'Internet', 65.00, 1],
    ['Utilities', 'Water bill', 45.00, 5],
    ['Education', 'Online course', 49.99, 2],
  ];

  currentExpenses.forEach(([catName, desc, amount, daysAgo]) => {
    if (catMap[catName]) {
      addExpense({
        categoryId: catMap[catName],
        description: desc,
        amount,
        date: format(subDays(now, daysAgo), 'yyyy-MM-dd'),
      });
    }
  });

  // Seed expenses for last month
  const lastMonthExpenses: [string, string, number, number][] = [
    ['Food & Dining', 'Grocery store', 120.00, 35],
    ['Food & Dining', 'Restaurants', 95.00, 38],
    ['Food & Dining', 'Coffee & snacks', 45.00, 32],
    ['Transportation', 'Gas', 110.00, 36],
    ['Transportation', 'Bus pass', 50.00, 40],
    ['Housing', 'Monthly rent', 1200.00, 31],
    ['Entertainment', 'Games', 59.99, 34],
    ['Entertainment', 'Streaming', 15.99, 31],
    ['Shopping', 'Clothing', 120.00, 37],
    ['Shopping', 'Household items', 65.00, 33],
    ['Healthcare', 'Prescription', 55.00, 39],
    ['Utilities', 'Electric bill', 105.00, 35],
    ['Utilities', 'Internet', 65.00, 31],
    ['Education', 'Books', 35.00, 36],
  ];

  lastMonthExpenses.forEach(([catName, desc, amount, daysAgo]) => {
    if (catMap[catName]) {
      addExpense({
        categoryId: catMap[catName],
        description: desc,
        amount,
        date: format(subDays(now, daysAgo), 'yyyy-MM-dd'),
      });
    }
  });

  // Seed expenses for two months ago
  const twoMonthsExpenses: [string, string, number, number][] = [
    ['Food & Dining', 'Groceries', 200.00, 65],
    ['Food & Dining', 'Dining out', 150.00, 60],
    ['Transportation', 'Gas & parking', 130.00, 62],
    ['Housing', 'Monthly rent', 1200.00, 61],
    ['Entertainment', 'Movies & games', 80.00, 63],
    ['Shopping', 'Online shopping', 200.00, 58],
    ['Healthcare', 'Dental visit', 120.00, 66],
    ['Utilities', 'All utilities', 210.00, 64],
    ['Education', 'Course subscription', 29.99, 60],
  ];

  twoMonthsExpenses.forEach(([catName, desc, amount, daysAgo]) => {
    if (catMap[catName]) {
      addExpense({
        categoryId: catMap[catName],
        description: desc,
        amount,
        date: format(subDays(now, daysAgo), 'yyyy-MM-dd'),
      });
    }
  });

  // Seed expenses for three months ago
  const threeMonthsExpenses: [string, string, number, number][] = [
    ['Food & Dining', 'Groceries & dining', 280.00, 95],
    ['Transportation', 'Transport costs', 95.00, 92],
    ['Housing', 'Monthly rent', 1200.00, 91],
    ['Entertainment', 'Entertainment', 55.00, 93],
    ['Shopping', 'Shopping', 180.00, 88],
    ['Healthcare', 'Medical', 75.00, 96],
    ['Utilities', 'Utilities', 195.00, 94],
  ];

  threeMonthsExpenses.forEach(([catName, desc, amount, daysAgo]) => {
    if (catMap[catName]) {
      addExpense({
        categoryId: catMap[catName],
        description: desc,
        amount,
        date: format(subDays(now, daysAgo), 'yyyy-MM-dd'),
      });
    }
  });
}
