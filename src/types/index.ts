export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // hex color for charts
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string; // YYYY-MM format
  limit: number;
}

export interface Expense {
  id: string;
  categoryId: string;
  date: string; // ISO date string
  description: string;
  amount: number;
}
