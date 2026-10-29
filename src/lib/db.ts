import { Pool, PoolConfig } from 'pg';
import {
  Account,
  Category,
  Transaction,
  Budget,
  RecurringBill,
  SavingsGoal,
  MonthlyAnalytics,
  CategorySpend,
} from './types';

// Global pool cache for Next.js hot reloading
let globalPool: Pool | null = null;
let tablesInitialized = false;

// Query cache with TTL for expensive analytics queries
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 6000; // 6 seconds

function getCached<T>(key: string): T | null {
  const entry = queryCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data as T;
  }
  return null;
}

function setCached<T>(key: string, data: T) {
  queryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache() {
  queryCache.clear();
}

export function getPoolConfig(): PoolConfig {
  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'postgres'}:${encodeURIComponent(
      process.env.PGPASSWORD || 'postgres'
    )}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${
      process.env.PGDATABASE || 'finance_tracker'
    }`;

  return {
    connectionString,
    max: 15,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 4000,
    allowExitOnIdle: true,
  };
}

export function getPool(): Pool {
  if (!globalPool) {
    globalPool = new Pool(getPoolConfig());
    globalPool.on('error', (err) => {
      console.warn('PostgreSQL idle client notice:', err.message);
    });
  }
  return globalPool;
}

export function resetPool(newConnectionString?: string) {
  if (globalPool) {
    globalPool.end().catch(() => {});
    globalPool = null;
  }
  if (newConnectionString) {
    process.env.DATABASE_URL = newConnectionString;
  }
  tablesInitialized = false;
  invalidateCache();
  return getPool();
}

// In-memory fallback dataset in case PostgreSQL is unreachable
const inMemoryData: {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringBill[];
  goals: SavingsGoal[];
} = {
  accounts: [
    { id: 1, name: 'Main Checking', type: 'checking', balance: 5420.5, currency: 'USD', color: '#6366f1' },
    { id: 2, name: 'High Yield Savings', type: 'savings', balance: 18450.0, currency: 'USD', color: '#10b981' },
    { id: 3, name: 'Sapphire Credit Card', type: 'credit', balance: -1280.4, currency: 'USD', color: '#f43f5e' },
    { id: 4, name: 'Vanguard Portfolio', type: 'investment', balance: 32400.0, currency: 'USD', color: '#0ea5e9' },
  ],
  categories: [
    { id: 1, name: 'Food & Dining', type: 'expense', colour: '#f97316', icon: 'utensils' },
    { id: 2, name: 'Transport', type: 'expense', colour: '#3b82f6', icon: 'car' },
    { id: 3, name: 'Housing', type: 'expense', colour: '#8b5cf6', icon: 'home' },
    { id: 4, name: 'Utilities', type: 'expense', colour: '#06b6d4', icon: 'zap' },
    { id: 5, name: 'Healthcare', type: 'expense', colour: '#ef4444', icon: 'heart-pulse' },
    { id: 6, name: 'Entertainment', type: 'expense', colour: '#ec4899', icon: 'film' },
    { id: 7, name: 'Shopping', type: 'expense', colour: '#f59e0b', icon: 'shopping-bag' },
    { id: 8, name: 'Education', type: 'expense', colour: '#10b981', icon: 'book' },
    { id: 9, name: 'Travel', type: 'expense', colour: '#6366f1', icon: 'plane' },
    { id: 10, name: 'Subscriptions', type: 'expense', colour: '#14b8a6', icon: 'refresh-cw' },
    { id: 11, name: 'Salary', type: 'income', colour: '#22c55e', icon: 'briefcase' },
    { id: 12, name: 'Freelance & Bonus', type: 'income', colour: '#84cc16', icon: 'laptop' },
    { id: 13, name: 'Dividends & Yield', type: 'income', colour: '#a3e635', icon: 'trending-up' },
  ],
  transactions: [
    { id: 1, account_id: 1, category_id: 11, amount: 4500, type: 'income', description: 'Monthly Tech Salary', date: '2026-10-01', notes: 'Direct deposit' },
    { id: 2, account_id: 1, category_id: 3, amount: 1450, type: 'expense', description: 'Apartment Rent', date: '2026-10-02' },
    { id: 3, account_id: 3, category_id: 1, amount: 112.5, type: 'expense', description: 'Whole Foods Grocery', date: '2026-10-05' },
    { id: 4, account_id: 3, category_id: 6, amount: 45.0, type: 'expense', description: 'Cinema IMAX Tickets', date: '2026-10-08' },
    { id: 5, account_id: 1, category_id: 10, amount: 19.99, type: 'expense', description: 'Spotify Family Subscription', date: '2026-10-10' },
    { id: 6, account_id: 1, category_id: 12, amount: 850.0, type: 'income', description: 'Web Development Client Work', date: '2026-10-12' },
    { id: 7, account_id: 3, category_id: 7, amount: 189.0, type: 'expense', description: 'Ergonomic Desk Accessories', date: '2026-10-14' },
    { id: 8, account_id: 1, category_id: 4, amount: 85.4, type: 'expense', description: 'High-speed Fiber Internet', date: '2026-10-16' },
    { id: 9, account_id: 3, category_id: 1, amount: 64.2, type: 'expense', description: 'Artisan Bistro Dinner', date: '2026-10-18' },
    { id: 10, account_id: 1, category_id: 2, amount: 45.0, type: 'expense', description: 'Electric Vehicle Charging & Metro Pass', date: '2026-10-19' },
  ],
  budgets: [
    { id: 1, category_id: 1, amount: 600, month: '2026-10-01' },
    { id: 2, category_id: 2, amount: 200, month: '2026-10-01' },
    { id: 3, category_id: 3, amount: 1500, month: '2026-10-01' },
    { id: 4, category_id: 6, amount: 250, month: '2026-10-01' },
    { id: 5, category_id: 7, amount: 350, month: '2026-10-01' },
  ],
  recurring: [
    { id: 1, name: 'Netflix 4K Ultra', amount: 22.99, frequency: 'monthly', next_due_date: '2026-11-01', status: 'active', category_id: 10, account_id: 3 },
    { id: 2, name: 'Apartment Lease', amount: 1450.0, frequency: 'monthly', next_due_date: '2026-11-01', status: 'active', category_id: 3, account_id: 1 },
    { id: 3, name: 'Gym & Spa Membership', amount: 65.0, frequency: 'monthly', next_due_date: '2026-11-05', status: 'active', category_id: 5, account_id: 1 },
    { id: 4, name: 'GitHub Copilot & Cloud', amount: 19.0, frequency: 'monthly', next_due_date: '2026-11-12', status: 'active', category_id: 10, account_id: 3 },
  ],
  goals: [
    { id: 1, name: 'Emergency Fund', target_amount: 25000, current_amount: 18450, target_date: '2026-12-31', color: '#10b981', icon: 'shield' },
    { id: 2, name: 'Japan & Alps Trip', target_amount: 6000, current_amount: 4200, target_date: '2027-04-15', color: '#6366f1', icon: 'plane' },
    { id: 3, name: 'Next-Gen M4 Workstation', target_amount: 3500, current_amount: 2800, target_date: '2026-11-30', color: '#f59e0b', icon: 'laptop' },
  ],
};

/**
 * Initializes PostgreSQL schema: tables, indexes, and default categories.
 */
export async function initPostgresSchema() {
  if (tablesInitialized) return true;
  const pool = getPool();

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Accounts Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(20) NOT NULL,
          balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
          currency VARCHAR(3) NOT NULL DEFAULT 'USD',
          color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Categories Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          type VARCHAR(10) NOT NULL,
          colour VARCHAR(7) NOT NULL DEFAULT '#94a3b8',
          icon VARCHAR(30)
        );
      `);

      // 3. Transactions Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          amount NUMERIC(14, 2) NOT NULL,
          type VARCHAR(10) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // High-performance Composite Indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date_id ON transactions(date DESC, id DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_acc_date ON transactions(account_id, date DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_cat_date ON transactions(category_id, date DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date DESC);
      `);

      // 4. Budgets Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS budgets (
          id SERIAL PRIMARY KEY,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          amount NUMERIC(14, 2) NOT NULL,
          month DATE NOT NULL,
          CONSTRAINT uq_budget_category_month UNIQUE (category_id, month)
        );
        CREATE INDEX IF NOT EXISTS idx_budgets_month_cat ON budgets(month, category_id);
      `);

      // 5. Recurring Bills Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS recurring_bills (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          amount NUMERIC(14, 2) NOT NULL,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
          frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
          next_due_date DATE NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'active'
        );
        CREATE INDEX IF NOT EXISTS idx_recurring_due ON recurring_bills(next_due_date);
      `);

      // 6. Savings Goals Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS savings_goals (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          target_amount NUMERIC(14, 2) NOT NULL,
          current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
          target_date DATE NOT NULL,
          color VARCHAR(7) NOT NULL DEFAULT '#10b981',
          icon VARCHAR(30) DEFAULT 'target'
        );
      `);

      // Seed categories if empty
      const catCountRes = await client.query('SELECT COUNT(*) FROM categories');
      if (parseInt(catCountRes.rows[0].count) === 0) {
        for (const cat of inMemoryData.categories) {
          await client.query(
            'INSERT INTO categories (id, name, type, colour, icon) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
            [cat.id, cat.name, cat.type, cat.colour, cat.icon]
          );
        }
        await client.query("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));");
      }

      // Seed accounts if empty
      const accCountRes = await client.query('SELECT COUNT(*) FROM accounts');
      if (parseInt(accCountRes.rows[0].count) === 0) {
        for (const acc of inMemoryData.accounts) {
          await client.query(
            'INSERT INTO accounts (id, name, type, balance, currency, color) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
            [acc.id, acc.name, acc.type, acc.balance, acc.currency, acc.color]
          );
        }
        await client.query("SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts));");
      }

      // Seed transactions if empty
      const txCountRes = await client.query('SELECT COUNT(*) FROM transactions');
      if (parseInt(txCountRes.rows[0].count) === 0) {
        for (const tx of inMemoryData.transactions) {
          await client.query(
            'INSERT INTO transactions (id, account_id, category_id, amount, type, description, date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING',
            [tx.id, tx.account_id, tx.category_id, tx.amount, tx.type, tx.description, tx.date, tx.notes || null]
          );
        }
        await client.query("SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));");
      }

      await client.query('COMMIT');
      tablesInitialized = true;
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    return false;
  }
}

/**
 * Test PostgreSQL connection
 */
export async function testConnection(customConnectionString?: string): Promise<{
  connected: boolean;
  message: string;
  database?: string;
  version?: string;
}> {
  let pool: Pool | null = null;
  try {
    pool = new Pool({
      connectionString: customConnectionString || getPoolConfig().connectionString,
      connectionTimeoutMillis: 2500,
    });
    const client = await pool.connect();
    const res = await client.query('SELECT version(), current_database() as db');
    client.release();
    await pool.end();

    return {
      connected: true,
      message: 'Successfully connected to PostgreSQL!',
      database: res.rows[0]?.db,
      version: res.rows[0]?.version?.split(' ')?.[1] || '18',
    };
  } catch (err) {
    if (pool) {
      await pool.end().catch(() => {});
    }
    return {
      connected: false,
      message: (err as Error).message || 'Failed to connect to PostgreSQL',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA ACCESS LAYER: Reads/writes from PostgreSQL with fallback to memory
// ─────────────────────────────────────────────────────────────────────────────

export async function getAccounts(): Promise<Account[]> {
  const cacheKey = 'accounts_all';
  const cached = getCached<Account[]>(cacheKey);
  if (cached) return cached;

  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const res = await pool.query('SELECT * FROM accounts ORDER BY id ASC');
      const accounts = res.rows.map((r) => ({
        ...r,
        balance: parseFloat(r.balance),
      }));
      setCached(cacheKey, accounts);
      return accounts;
    }
  } catch (e) {
    // fallback
  }

  setCached(cacheKey, inMemoryData.accounts);
  return inMemoryData.accounts;
}

export async function createAccount(acc: Omit<Account, 'id'>): Promise<Account> {
  invalidateCache();
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const res = await pool.query(
        'INSERT INTO accounts (name, type, balance, currency, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [acc.name, acc.type, acc.balance, acc.currency || 'USD', acc.color || '#6366f1']
      );
      const r = res.rows[0];
      return { ...r, balance: parseFloat(r.balance) };
    }
  } catch (e) {
    // fallback
  }

  const newAcc: Account = {
    ...acc,
    id: inMemoryData.accounts.length ? Math.max(...inMemoryData.accounts.map((a) => a.id)) + 1 : 1,
    balance: Number(acc.balance),
  };
  inMemoryData.accounts.push(newAcc);
  return newAcc;
}

export async function updateAccount(id: number, data: Partial<Account>): Promise<Account | null> {
  invalidateCache();
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const fields: string[] = [];
      const values: any[] = [];
      let i = 1;

      if (data.name !== undefined) { fields.push(`name = $${i++}`); values.push(data.name); }
      if (data.type !== undefined) { fields.push(`type = $${i++}`); values.push(data.type); }
      if (data.balance !== undefined) { fields.push(`balance = $${i++}`); values.push(data.balance); }
      if (data.color !== undefined) { fields.push(`color = $${i++}`); values.push(data.color); }

      values.push(id);
      const query = `UPDATE accounts SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
      const res = await pool.query(query, values);
      if (res.rows.length) {
        const r = res.rows[0];
        return { ...r, balance: parseFloat(r.balance) };
      }
      return null;
    }
  } catch (e) {
    // fallback
  }

  const idx = inMemoryData.accounts.findIndex((a) => a.id === id);
  if (idx !== -1) {
    inMemoryData.accounts[idx] = { ...inMemoryData.accounts[idx], ...data };
    return inMemoryData.accounts[idx];
  }
  return null;
}

export async function deleteAccount(id: number): Promise<boolean> {
  invalidateCache();
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      await pool.query('DELETE FROM accounts WHERE id = $1', [id]);
      return true;
    }
  } catch (e) {
    // fallback
  }

  inMemoryData.accounts = inMemoryData.accounts.filter((a) => a.id !== id);
  return true;
}

export async function getCategories(): Promise<Category[]> {
  const cacheKey = 'categories_all';
  const cached = getCached<Category[]>(cacheKey);
  if (cached) return cached;

  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const res = await pool.query('SELECT * FROM categories ORDER BY type ASC, name ASC');
      setCached(cacheKey, res.rows);
      return res.rows;
    }
  } catch (e) {
    // fallback
  }

  setCached(cacheKey, inMemoryData.categories);
  return inMemoryData.categories;
}

export async function createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  invalidateCache();
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const res = await pool.query(
        'INSERT INTO categories (name, type, colour, icon) VALUES ($1, $2, $3, $4) RETURNING *',
        [cat.name, cat.type, cat.colour || '#94a3b8', cat.icon || 'tag']
      );
      return res.rows[0];
    }
  } catch (e) {
    // fallback
  }

  const newCat: Category = {
    ...cat,
    id: inMemoryData.categories.length ? Math.max(...inMemoryData.categories.map((c) => c.id)) + 1 : 1,
  };
  inMemoryData.categories.push(newCat);
  return newCat;
}

export async function getTransactions(filters?: {
  account_id?: number;
  category_id?: number;
  type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}): Promise<Transaction[]> {
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      let sql = `
        SELECT t.id, t.account_id, t.category_id, t.amount, t.type, t.description, t.date, t.notes, t.created_at,
               a.name as account_name,
               c.name as category_name,
               c.colour as category_colour,
               c.icon as category_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE 1=1
      `;
      const values: any[] = [];
      let i = 1;

      if (filters?.account_id) {
        sql += ` AND t.account_id = $${i++}`;
        values.push(filters.account_id);
      }
      if (filters?.category_id) {
        sql += ` AND t.category_id = $${i++}`;
        values.push(filters.category_id);
      }
      if (filters?.type) {
        sql += ` AND t.type = $${i++}`;
        values.push(filters.type);
      }
      if (filters?.search) {
        sql += ` AND (t.description ILIKE $${i} OR t.notes ILIKE $${i})`;
        values.push(`%${filters.search}%`);
        i++;
      }
      if (filters?.date_from) {
        sql += ` AND t.date >= $${i++}`;
        values.push(filters.date_from);
      }
      if (filters?.date_to) {
        sql += ` AND t.date <= $${i++}`;
        values.push(filters.date_to);
      }

      sql += ` ORDER BY t.date DESC, t.id DESC`;
      if (filters?.limit) {
        sql += ` LIMIT $${i++}`;
        values.push(filters.limit);
      }
      if (filters?.offset) {
        sql += ` OFFSET $${i++}`;
        values.push(filters.offset);
      }

      const res = await pool.query(sql, values);
      return res.rows.map((r) => ({
        ...r,
        amount: parseFloat(r.amount),
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
      }));
    }
  } catch (e) {
    // fallback
  }

  // Fallback to memory
  let txs = [...inMemoryData.transactions];
  if (filters?.account_id) txs = txs.filter((t) => t.account_id === filters.account_id);
  if (filters?.category_id) txs = txs.filter((t) => t.category_id === filters.category_id);
  if (filters?.type) txs = txs.filter((t) => t.type === filters.type);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    txs = txs.filter((t) => t.description.toLowerCase().includes(s) || t.notes?.toLowerCase().includes(s));
  }
  if (filters?.date_from) txs = txs.filter((t) => t.date >= filters.date_from!);
  if (filters?.date_to) txs = txs.filter((t) => t.date <= filters.date_to!);

  const sorted = txs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((t) => {
      const acc = inMemoryData.accounts.find((a) => a.id === t.account_id);
      const cat = inMemoryData.categories.find((c) => c.id === t.category_id);
      return {
        ...t,
        account_name: acc?.name,
        category_name: cat?.name,
        category_colour: cat?.colour,
        category_icon: cat?.icon,
      };
    });

  if (filters?.offset !== undefined && filters?.limit !== undefined) {
    return sorted.slice(filters.offset, filters.offset + filters.limit);
  } else if (filters?.limit !== undefined) {
    return sorted.slice(0, filters.limit);
  }
  return sorted;
}

export async function createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  invalidateCache();
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const res = await client.query(
          `INSERT INTO transactions (account_id, category_id, amount, type, description, date, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [tx.account_id, tx.category_id || null, tx.amount, tx.type, tx.description, tx.date, tx.notes || null]
        );
        const created = res.rows[0];

        // Update balance atomically
        if (tx.type === 'income') {
          await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [tx.amount, tx.account_id]);
        } else if (tx.type === 'expense') {
          await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [tx.amount, tx.account_id]);
        }

        await client.query('COMMIT');
        return {
          ...created,
          amount: parseFloat(created.amount),
          date: created.date instanceof Date ? created.date.toISOString().split('T')[0] : created.date,
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  } catch (e) {
    // fallback
  }

  const newTx: Transaction = {
    ...tx,
    id: inMemoryData.transactions.length ? Math.max(...inMemoryData.transactions.map((t) => t.id)) + 1 : 1,
    amount: Number(tx.amount),
  };
  inMemoryData.transactions.unshift(newTx);

  const acc = inMemoryData.accounts.find((a) => a.id === tx.account_id);
  if (acc) {
    if (tx.type === 'income') acc.balance += newTx.amount;
    else if (tx.type === 'expense') acc.balance -= newTx.amount;
  }
  return newTx;
}

export async function bulkCreateTransactions(txs: Omit<Transaction, 'id'>[]): Promise<Transaction[]> {
  invalidateCache();
  const created: Transaction[] = [];
  for (const tx of txs) {
    const item = await createTransaction(tx);
    created.push(item);
  }
  return created;
}

export async function deleteTransaction(id: number): Promise<boolean> {
  invalidateCache();
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const existing = await client.query('SELECT * FROM transactions WHERE id = $1', [id]);
        if (existing.rows.length) {
          const tx = existing.rows[0];
          if (tx.type === 'income') {
            await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [tx.amount, tx.account_id]);
          } else if (tx.type === 'expense') {
            await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [tx.amount, tx.account_id]);
          }
          await client.query('DELETE FROM transactions WHERE id = $1', [id]);
        }
        await client.query('COMMIT');
        return true;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  } catch (e) {
    // fallback
  }

  const tx = inMemoryData.transactions.find((t) => t.id === id);
  if (tx) {
    const acc = inMemoryData.accounts.find((a) => a.id === tx.account_id);
    if (acc) {
      if (tx.type === 'income') acc.balance -= tx.amount;
      else if (tx.type === 'expense') acc.balance += tx.amount;
    }
    inMemoryData.transactions = inMemoryData.transactions.filter((t) => t.id !== id);
  }
  return true;
}

export async function getBudgets(month?: string): Promise<Budget[]> {
  const targetMonth = month || new Date().toISOString().slice(0, 7) + '-01';
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const sql = `
        SELECT b.id, b.category_id, b.amount, b.month,
               c.name as category_name, c.colour as category_colour, c.icon as category_icon,
               COALESCE(spent_sub.total, 0) as spent
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        LEFT JOIN (
          SELECT category_id, SUM(amount) as total
          FROM transactions
          WHERE type = 'expense'
            AND date >= $1::date
            AND date < ($1::date + INTERVAL '1 month')
          GROUP BY category_id
        ) spent_sub ON b.category_id = spent_sub.category_id
        WHERE b.month = $1::date
      `;
      const res = await pool.query(sql, [targetMonth]);
      return res.rows.map((r) => {
        const budgeted = parseFloat(r.amount);
        const spent = parseFloat(r.spent || 0);
        return {
          id: r.id,
          category_id: r.category_id,
          amount: budgeted,
          month: targetMonth,
          category_name: r.category_name,
          category_colour: r.category_colour,
          category_icon: r.category_icon,
          spent: spent,
          remaining: budgeted - spent,
          pct: budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0,
        };
      });
    }
  } catch (e) {
    // fallback
  }

  return inMemoryData.budgets.map((b) => {
    const cat = inMemoryData.categories.find((c) => c.id === b.category_id);
    const spent = inMemoryData.transactions
      .filter((t) => t.category_id === b.category_id && t.type === 'expense' && t.date.startsWith(targetMonth.slice(0, 7)))
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      ...b,
      category_name: cat?.name,
      category_colour: cat?.colour,
      category_icon: cat?.icon,
      spent: spent,
      remaining: b.amount - spent,
      pct: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
    };
  });
}

export async function createOrUpdateBudget(category_id: number, amount: number, month: string): Promise<Budget> {
  invalidateCache();
  const cleanMonth = month.length === 7 ? `${month}-01` : month;
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const res = await pool.query(
        `INSERT INTO budgets (category_id, amount, month)
         VALUES ($1, $2, $3)
         ON CONFLICT (category_id, month)
         DO UPDATE SET amount = EXCLUDED.amount
         RETURNING *`,
        [category_id, amount, cleanMonth]
      );
      const r = res.rows[0];
      return { ...r, amount: parseFloat(r.amount) };
    }
  } catch (e) {
    // fallback
  }

  const existing = inMemoryData.budgets.find(
    (b) => b.category_id === category_id && b.month.startsWith(cleanMonth.slice(0, 7))
  );
  if (existing) {
    existing.amount = amount;
    return existing;
  }
  const newBudget: Budget = {
    id: inMemoryData.budgets.length ? Math.max(...inMemoryData.budgets.map((b) => b.id)) + 1 : 1,
    category_id,
    amount,
    month: cleanMonth,
  };
  inMemoryData.budgets.push(newBudget);
  return newBudget;
}

export async function getRecurringBills(): Promise<RecurringBill[]> {
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const res = await pool.query(`
        SELECT r.id, r.name, r.amount, r.category_id, r.account_id, r.frequency, r.next_due_date, r.status,
               c.name as category_name, c.colour as category_colour, c.icon as category_icon
        FROM recurring_bills r
        LEFT JOIN categories c ON r.category_id = c.id
        ORDER BY r.next_due_date ASC
      `);
      return res.rows.map((r) => ({
        ...r,
        amount: parseFloat(r.amount),
        next_due_date: r.next_due_date instanceof Date ? r.next_due_date.toISOString().split('T')[0] : String(r.next_due_date),
      }));
    }
  } catch (e) {
    // fallback
  }
  return inMemoryData.recurring.map((r) => {
    const cat = inMemoryData.categories.find((c) => c.id === r.category_id);
    return {
      ...r,
      category_name: cat?.name,
      category_colour: cat?.colour,
      category_icon: cat?.icon,
    };
  });
}

export async function createRecurringBill(bill: Omit<RecurringBill, 'id'>): Promise<RecurringBill> {
  invalidateCache();
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const res = await pool.query(
        `INSERT INTO recurring_bills (name, amount, category_id, account_id, frequency, next_due_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [bill.name, bill.amount, bill.category_id || null, bill.account_id || null, bill.frequency, bill.next_due_date, bill.status || 'active']
      );
      const r = res.rows[0];
      return { ...r, amount: parseFloat(r.amount) };
    }
  } catch (e) {
    // fallback
  }

  const newBill: RecurringBill = {
    ...bill,
    id: inMemoryData.recurring.length ? Math.max(...inMemoryData.recurring.map((b) => b.id)) + 1 : 1,
  };
  inMemoryData.recurring.push(newBill);
  return newBill;
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      const res = await pool.query('SELECT * FROM savings_goals ORDER BY target_date ASC');
      return res.rows.map((r) => ({
        ...r,
        target_amount: parseFloat(r.target_amount),
        current_amount: parseFloat(r.current_amount),
        target_date: r.target_date instanceof Date ? r.target_date.toISOString().split('T')[0] : String(r.target_date),
      }));
    }
  } catch (e) {
    // fallback
  }
  return inMemoryData.goals;
}

export async function getAnalytics(year: number = 2026, accountId?: number): Promise<{
  monthly: MonthlyAnalytics[];
  categories: CategorySpend[];
}> {
  const cacheKey = `analytics_${year}_${accountId || 'all'}`;
  const cached = getCached<{ monthly: MonthlyAnalytics[]; categories: CategorySpend[] }>(cacheKey);
  if (cached) return cached;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthly: MonthlyAnalytics[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    month_name: monthNames[i],
    income: 0,
    expenses: 0,
    net: 0,
    savings_rate: 0,
  }));

  try {
    const isPg = await initPostgresSchema();
    if (isPg) {
      const pool = getPool();
      let sqlMonthly = `
        SELECT EXTRACT(MONTH FROM date) as m,
               SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as inc,
               SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as exp
        FROM transactions
        WHERE EXTRACT(YEAR FROM date) = $1
      `;
      const vals: any[] = [year];
      if (accountId) {
        sqlMonthly += ` AND account_id = $2`;
        vals.push(accountId);
      }
      sqlMonthly += ` GROUP BY m ORDER BY m ASC`;

      const monthlyRes = await pool.query(sqlMonthly, vals);
      for (const row of monthlyRes.rows) {
        const m = parseInt(row.m);
        if (m >= 1 && m <= 12) {
          const inc = parseFloat(row.inc || 0);
          const exp = parseFloat(row.exp || 0);
          monthly[m - 1].income = inc;
          monthly[m - 1].expenses = exp;
          monthly[m - 1].net = inc - exp;
          monthly[m - 1].savings_rate = inc > 0 ? Math.max(0, Math.round(((inc - exp) / inc) * 100)) : 0;
        }
      }

      let sqlCat = `
        SELECT t.category_id, c.name, c.colour, c.icon, SUM(t.amount) as total
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'expense' AND EXTRACT(YEAR FROM t.date) = $1
      `;
      if (accountId) sqlCat += ` AND t.account_id = $2`;
      sqlCat += ` GROUP BY t.category_id, c.name, c.colour, c.icon ORDER BY total DESC`;

      const catRes = await pool.query(sqlCat, vals);
      const totalAll = catRes.rows.reduce((sum, r) => sum + parseFloat(r.total), 0) || 1;
      const categories: CategorySpend[] = catRes.rows.map((r) => {
        const tot = parseFloat(r.total);
        return {
          category_id: r.category_id,
          category: r.name || 'Uncategorized',
          colour: r.colour || '#94a3b8',
          icon: r.icon || 'tag',
          total: tot,
          pct: Math.round((tot / totalAll) * 100),
        };
      });

      const result = { monthly, categories };
      setCached(cacheKey, result);
      return result;
    }
  } catch (e) {
    // fallback
  }

  // Memory fallback calculations
  for (const tx of inMemoryData.transactions) {
    const txDate = new Date(tx.date);
    if (txDate.getFullYear() === year) {
      const m = txDate.getMonth();
      if (tx.type === 'income') monthly[m].income += tx.amount;
      else if (tx.type === 'expense') monthly[m].expenses += tx.amount;
    }
  }

  for (const m of monthly) {
    m.net = m.income - m.expenses;
    m.savings_rate = m.income > 0 ? Math.max(0, Math.round(((m.income - m.expenses) / m.income) * 100)) : 0;
  }

  const catMap = new Map<number, { name: string; colour: string; icon?: string; total: number }>();
  let totalExpense = 0;
  for (const tx of inMemoryData.transactions) {
    if (tx.type === 'expense') {
      const cat = inMemoryData.categories.find((c) => c.id === tx.category_id);
      const cur = catMap.get(tx.category_id || 0) || {
        name: cat?.name || 'Uncategorized',
        colour: cat?.colour || '#94a3b8',
        icon: cat?.icon || 'tag',
        total: 0,
      };
      cur.total += tx.amount;
      catMap.set(tx.category_id || 0, cur);
      totalExpense += tx.amount;
    }
  }

  const categories: CategorySpend[] = Array.from(catMap.entries()).map(([id, val]) => ({
    category_id: id === 0 ? null : id,
    category: val.name,
    colour: val.colour,
    icon: val.icon,
    total: val.total,
    pct: totalExpense > 0 ? Math.round((val.total / totalExpense) * 100) : 0,
  }));

  const result = { monthly, categories };
  setCached(cacheKey, result);
  return result;
}
