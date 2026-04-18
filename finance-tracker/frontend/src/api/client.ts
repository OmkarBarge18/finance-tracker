import axios, { type AxiosError } from 'axios';
import type {
  Account, AccountCreate, Category,
  Transaction, TransactionCreate, TransactionUpdate, TransactionFilters,
  Budget, BudgetCreate, BudgetProgress, MonthlySummary, CategorySpend,
} from '../types';

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return Promise.reject(new Error(detail));
    if (Array.isArray(detail)) {
      const msgs = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      return Promise.reject(new Error(msgs));
    }
    if (!err.response) {
      return Promise.reject(new Error('Cannot reach the server — is uvicorn running on port 8000?'));
    }
    return Promise.reject(err);
  }
);

export const api = {
  getAccounts:   async (): Promise<Account[]> => (await http.get('/accounts/')).data,
  createAccount: async (b: AccountCreate): Promise<Account> => (await http.post('/accounts/', b)).data,
  updateAccount: async (id: number, b: Partial<AccountCreate>): Promise<Account> => (await http.patch(`/accounts/${id}`, b)).data,
  deleteAccount: async (id: number): Promise<void> => { await http.delete(`/accounts/${id}`); },

  getCategories:  async (type?: string): Promise<Category[]> =>
    (await http.get('/categories/', { params: type ? { type } : {} })).data,
  createCategory: async (b: { name: string; type: string; colour: string; icon?: string }): Promise<Category> =>
    (await http.post('/categories/', b)).data,
  deleteCategory: async (id: number): Promise<void> => { await http.delete(`/categories/${id}`); },

  getTransactions: async (f: TransactionFilters = {}): Promise<Transaction[]> => {
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined && v !== '' && v !== null));
    return (await http.get('/transactions/', { params })).data;
  },
  createTransaction:      async (b: TransactionCreate): Promise<Transaction> => (await http.post('/transactions/', b)).data,
  updateTransaction:      async (id: number, b: TransactionUpdate): Promise<Transaction> => (await http.patch(`/transactions/${id}`, b)).data,
  deleteTransaction:      async (id: number): Promise<void> => { await http.delete(`/transactions/${id}`); },
  bulkCreateTransactions: async (transactions: TransactionCreate[]): Promise<Transaction[]> =>
    (await http.post('/transactions/bulk', { transactions })).data,

  getMonthlySummary: async (year: number, account_id?: number): Promise<MonthlySummary[]> =>
    (await http.get('/transactions/analytics/monthly', { params: { year, ...(account_id ? { account_id } : {}) } })).data,
  getCategorySpend: async (p: { date_from?: string; date_to?: string; account_id?: number }): Promise<CategorySpend[]> => {
    const params = Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined));
    return (await http.get('/transactions/analytics/by-category', { params })).data;
  },

  getBudgets:        async (month?: string): Promise<Budget[]> =>
    (await http.get('/budgets/', { params: month ? { month } : {} })).data,
  createBudget:      async (b: BudgetCreate): Promise<Budget> => (await http.post('/budgets/', b)).data,
  deleteBudget:      async (id: number): Promise<void> => { await http.delete(`/budgets/${id}`); },
  getBudgetProgress: async (month: string): Promise<BudgetProgress[]> =>
    (await http.get('/budgets/progress', { params: { month } })).data,
};
