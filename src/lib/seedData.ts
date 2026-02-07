import { format, subMonths, subDays } from "date-fns";
import { useCategoryStore } from "@/stores/categoryStore";
import { useBudgetStore } from "@/stores/budgetStore";
import { useExpenseStore } from "@/stores/expenseStore";

export function seedIfEmpty() {
  // Check localStorage directly to avoid async hydration race condition
  const expenseData = localStorage.getItem("budget-expenses");
  const budgetData = localStorage.getItem("budget-budgets");

  if (expenseData || budgetData) {
    try {
      const parsed = expenseData ? JSON.parse(expenseData) : null;
      if (parsed?.state?.expenses?.length > 0) return;
      const parsedB = budgetData ? JSON.parse(budgetData) : null;
      if (parsedB?.state?.budgets?.length > 0) return;
    } catch {
      return;
    }
  }

  const categories = useCategoryStore.getState().categories;

  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const lastMonth = format(subMonths(now, 1), "yyyy-MM");
  const twoMonthsAgo = format(subMonths(now, 2), "yyyy-MM");
  const threeMonthsAgo = format(subMonths(now, 3), "yyyy-MM");

  const catMap: Record<string, string> = {};
  categories.forEach((c) => {
    catMap[c.name] = c.id;
  });

  const { setBudget } = useBudgetStore.getState();
  const { addExpense } = useExpenseStore.getState();

  // Set budgets for current and past months
  const budgetLimits: [string, number][] = [
    ["Food & Dining", 600],
    ["Transportation", 300],
    ["Housing", 1500],
    ["Entertainment", 200],
    ["Shopping", 400],
    ["Healthcare", 150],
    ["Utilities", 250],
    ["Education", 100],
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
    ["Food & Dining", "Grocery store", 85.5, 2],
    ["Food & Dining", "Restaurant dinner", 62.3, 5],
    ["Food & Dining", "Coffee shop", 12.75, 1],
    ["Food & Dining", "Lunch takeout", 18.9, 3],
    ["Transportation", "Gas station", 55.0, 4],
    ["Transportation", "Parking fee", 15.0, 6],
    ["Transportation", "Uber ride", 24.5, 2],
    ["Housing", "Monthly rent", 1200.0, 1],
    ["Housing", "Home repairs", 85.0, 8],
    ["Entertainment", "Movie tickets", 32.0, 7],
    ["Entertainment", "Streaming subscription", 15.99, 1],
    ["Entertainment", "Concert tickets", 75.0, 3],
    ["Shopping", "New jacket", 89.99, 5],
    ["Shopping", "Electronics", 149.99, 2],
    ["Shopping", "Books", 34.5, 6],
    ["Healthcare", "Pharmacy", 28.5, 4],
    ["Healthcare", "Doctor visit copay", 40.0, 7],
    ["Utilities", "Electric bill", 95.0, 3],
    ["Utilities", "Internet", 65.0, 1],
    ["Utilities", "Water bill", 45.0, 5],
    ["Education", "Online course", 49.99, 2],
  ];

  currentExpenses.forEach(([catName, desc, amount, daysAgo]) => {
    if (catMap[catName]) {
      addExpense({
        categoryId: catMap[catName],
        description: desc,
        amount,
        date: format(subDays(now, daysAgo), "yyyy-MM-dd"),
      });
    }
  });

  // Seed expenses for last month
  const lastMonthExpenses: [string, string, number, number][] = [
    ["Food & Dining", "Grocery store", 120.0, 35],
    ["Food & Dining", "Restaurants", 95.0, 38],
    ["Food & Dining", "Coffee & snacks", 45.0, 32],
    ["Transportation", "Gas", 110.0, 36],
    ["Transportation", "Bus pass", 50.0, 40],
    ["Housing", "Monthly rent", 1200.0, 31],
    ["Entertainment", "Games", 59.99, 34],
    ["Entertainment", "Streaming", 15.99, 31],
    ["Shopping", "Clothing", 120.0, 37],
    ["Shopping", "Household items", 65.0, 33],
    ["Healthcare", "Prescription", 55.0, 39],
    ["Utilities", "Electric bill", 105.0, 35],
    ["Utilities", "Internet", 65.0, 31],
    ["Education", "Books", 35.0, 36],
  ];

  lastMonthExpenses.forEach(([catName, desc, amount, daysAgo]) => {
    if (catMap[catName]) {
      addExpense({
        categoryId: catMap[catName],
        description: desc,
        amount,
        date: format(subDays(now, daysAgo), "yyyy-MM-dd"),
      });
    }
  });

  // Seed expenses for two months ago
  const twoMonthsExpenses: [string, string, number, number][] = [
    ["Food & Dining", "Groceries", 200.0, 65],
    ["Food & Dining", "Dining out", 150.0, 60],
    ["Transportation", "Gas & parking", 130.0, 62],
    ["Housing", "Monthly rent", 1200.0, 61],
    ["Entertainment", "Movies & games", 80.0, 63],
    ["Shopping", "Online shopping", 200.0, 58],
    ["Healthcare", "Dental visit", 120.0, 66],
    ["Utilities", "All utilities", 210.0, 64],
    ["Education", "Course subscription", 29.99, 60],
  ];

  twoMonthsExpenses.forEach(([catName, desc, amount, daysAgo]) => {
    if (catMap[catName]) {
      addExpense({
        categoryId: catMap[catName],
        description: desc,
        amount,
        date: format(subDays(now, daysAgo), "yyyy-MM-dd"),
      });
    }
  });

  // Seed expenses for three months ago
  const threeMonthsExpenses: [string, string, number, number][] = [
    ["Food & Dining", "Groceries & dining", 280.0, 95],
    ["Transportation", "Transport costs", 95.0, 92],
    ["Housing", "Monthly rent", 1200.0, 91],
    ["Entertainment", "Entertainment", 55.0, 93],
    ["Shopping", "Shopping", 180.0, 88],
    ["Healthcare", "Medical", 75.0, 96],
    ["Utilities", "Utilities", 195.0, 94],
  ];

  threeMonthsExpenses.forEach(([catName, desc, amount, daysAgo]) => {
    if (catMap[catName]) {
      addExpense({
        categoryId: catMap[catName],
        description: desc,
        amount,
        date: format(subDays(now, daysAgo), "yyyy-MM-dd"),
      });
    }
  });
}
