// src/types.ts
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type CategoryType = 'income' | 'expense';

export interface Account {
  id: number; name: string; type: AccountType;
  balance: number; currency: string; color: string; created_at: string;
}
export interface AccountCreate {
  name: string; type: AccountType; balance?: number; currency?: string; color?: string;
}

export interface Category {
  id: number; name: string; type: CategoryType; colour: string; icon: string | null;
}

export interface Transaction {
  id: number; account_id: number; category_id: number | null;
  amount: number; type: TransactionType; description: string | null;
  date: string; notes: string | null; created_at: string;
  account: Account; category: Category | null;
}
export interface TransactionCreate {
  account_id: number; category_id?: number | null;
  amount: number; type: TransactionType;
  description?: string; date: string; notes?: string;
}
export interface TransactionUpdate extends Partial<TransactionCreate> {}
export interface TransactionFilters {
  account_id?: number; category_id?: number; type?: TransactionType;
  date_from?: string; date_to?: string; search?: string;
  limit?: number; offset?: number;
}

export interface Budget {
  id: number; category_id: number; amount: number; month: string; category: Category;
}
export interface BudgetCreate {
  category_id: number; amount: number; month: string;
}
export interface BudgetProgress {
  budget_id: number; category: string; colour: string;
  budgeted: number; spent: number; remaining: number; pct: number;
}

export interface MonthlySummary {
  month: number; income: number; expenses: number; net: number;
}
export interface CategorySpend {
  category_id: number | null; category: string; colour: string; total: number; pct: number;
}
