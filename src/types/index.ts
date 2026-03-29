export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // hex color for charts
  description?: string; // Optional description
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string; // YYYY-MM format
  limit: number;
  ownerId?: string; // Optional owner ID
  ownerSplits?: { ownerId: string; limit: number }[]; // Optional split by owners
}

export interface Expense {
  id: string;
  categoryId: string;
  date: string; // ISO datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
  description: string;
  amount: number;
  ownerId?: string; // Optional owner ID
}

export interface Owner {
  id: string;
  name: string;
  color: string; // hex color for UI
}
