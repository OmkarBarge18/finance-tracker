export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: number;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  color: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  colour: string;
  icon?: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id?: number | null;
  amount: number;
  type: TransactionType;
  description: string;
  date: string; // YYYY-MM-DD
  notes?: string | null;
  created_at?: string;
  // joined/enriched fields
  account_name?: string;
  category_name?: string;
  category_colour?: string;
  category_icon?: string;
}

export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  month: string; // YYYY-MM-01
  category_name?: string;
  category_colour?: string;
  category_icon?: string;
  spent?: number;
  remaining?: number;
  pct?: number;
}

export interface RecurringBill {
  id: number;
  name: string;
  amount: number;
  category_id?: number | null;
  account_id?: number | null;
  frequency: 'monthly' | 'yearly' | 'weekly';
  next_due_date: string;
  status: 'active' | 'paused';
  category_name?: string;
  category_colour?: string;
  category_icon?: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  color: string;
  icon: string;
}

export interface MonthlyAnalytics {
  month: number;
  month_name: string;
  income: number;
  expenses: number;
  net: number;
  savings_rate: number;
}

export interface CategorySpend {
  category_id: number | null;
  category: string;
  colour: string;
  icon?: string;
  total: number;
  pct: number;
}

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  ssl?: boolean;
}
