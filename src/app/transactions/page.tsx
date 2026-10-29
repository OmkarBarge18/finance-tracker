'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Search,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Transaction, Account, Category } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { springPress, staggerEntrance } from '@/lib/animations';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search input & debounced search value
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filters
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState('2026-10-01');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedAccount !== 'all') params.append('account_id', selectedAccount);
      if (selectedCategory !== 'all') params.append('category_id', selectedCategory);
      if (selectedType !== 'all') params.append('type', selectedType);
      params.append('limit', '250');

      const [txRes, accRes, catRes] = await Promise.all([
        fetch(`/api/transactions?${params.toString()}`),
        fetch('/api/accounts'),
        fetch('/api/categories'),
      ]);

      if (txRes.ok) setTransactions(await txRes.json());
      if (accRes.ok) setAccounts(await accRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (e) {
      console.warn('Transactions load error:', e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedAccount, selectedCategory, selectedType]);

  useEffect(() => {
    loadData();

    const handleRefresh = () => loadData();
    window.addEventListener('finance:transaction-created', handleRefresh);
    window.addEventListener('finance:data-refreshed', handleRefresh);

    return () => {
      window.removeEventListener('finance:transaction-created', handleRefresh);
      window.removeEventListener('finance:data-refreshed', handleRefresh);
    };
  }, [loadData]);

  useEffect(() => {
    if (!loading) {
      staggerEntrance('.table-row-item', 0.02);
    }
  }, [loading, transactions, page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const exportCSV = useCallback(() => {
    const headers = ['Date', 'Account', 'Category', 'Description', 'Type', 'Amount', 'Notes'];
    const rows = transactions.map((t) => [
      t.date,
      `"${t.account_name || ''}"`,
      `"${t.category_name || ''}"`,
      `"${t.description || ''}"`,
      t.type,
      t.amount,
      `"${t.notes || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finance_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [transactions]);

  const totalPages = useMemo(() => {
    return Math.ceil(transactions.length / pageSize) || 1;
  }, [transactions.length, pageSize]);

  const paginatedTxs = useMemo(() => {
    return transactions.slice((page - 1) * pageSize, page * pageSize);
  }, [transactions, page, pageSize]);

  return (
    <div>
      <Topbar
        title="Transactions"
        subtitle="Search, filter, and export all financial ledger events"
        onOpenQuickAdd={() => {
          window.dispatchEvent(new CustomEvent('finance:open-add'));
        }}
        onOpenCsvImport={() => {
          window.dispatchEvent(new CustomEvent('finance:open-csv'));
        }}
        onOpenDbModal={() => {
          window.dispatchEvent(new CustomEvent('finance:open-db'));
        }}
        onOpenMobileMenu={() => {
          window.dispatchEvent(new CustomEvent('finance:toggle-mobile-menu'));
        }}
        isDbConnected={true}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filters & Export Bar */}
        <div className="surface-card rounded-xl p-4 sm:p-5 border border-[#1f2937] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by payee, description, or notes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full surface-input text-xs sm:text-sm pl-9 pr-4 py-2 rounded-lg"
              />
            </div>

            {/* Export & Actions */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={(e) => {
                  springPress(e.currentTarget);
                  exportCSV();
                }}
                disabled={transactions.length === 0}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#0b0f17] hover:bg-slate-800 border border-[#1f2937] text-xs font-medium text-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export CSV ({transactions.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2 border-t border-[#1f2937]">
            {/* Type */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full surface-input px-2.5 py-1.5 rounded-lg text-xs"
              >
                <option value="all" className="bg-slate-900">All Types</option>
                <option value="expense" className="bg-slate-900">Expense</option>
                <option value="income" className="bg-slate-900">Income</option>
                <option value="transfer" className="bg-slate-900">Transfer</option>
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setPage(1);
                }}
                className="w-full surface-input px-2.5 py-1.5 rounded-lg text-xs"
              >
                <option value="all" className="bg-slate-900">All Accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-slate-900">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full surface-input px-2.5 py-1.5 rounded-lg text-xs"
              >
                <option value="all" className="bg-slate-900">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table with Horizontal Scroll Container */}
        <div className="surface-card rounded-xl border border-[#1f2937] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#0b0f17] border-b border-[#1f2937] text-[11px] uppercase font-semibold text-slate-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937] text-xs">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-800 rounded w-20" /></td>
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-800 rounded w-48" /></td>
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-800 rounded w-24" /></td>
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-800 rounded w-28" /></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-3.5 bg-slate-800 rounded w-16 ml-auto" /></td>
                      <td className="py-3.5 px-4 text-center"><div className="h-3.5 bg-slate-800 rounded w-6 mx-auto" /></td>
                    </tr>
                  ))
                ) : paginatedTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No transactions match the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedTxs.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const isTransfer = tx.type === 'transfer';

                    return (
                      <tr
                        key={tx.id}
                        className="table-row-item hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="py-3 px-4 text-slate-400 font-tabular whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">
                            {tx.description}
                          </p>
                          {tx.notes && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{tx.notes}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.category_name ? (
                            <span className="text-slate-300 text-xs">
                              {tx.category_name}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">Uncategorized</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                          {tx.account_name || 'Main Account'}
                        </td>
                        <td className="py-3 px-4 text-right font-tabular font-bold whitespace-nowrap">
                          <span
                            className={
                              isIncome
                                ? 'text-emerald-400'
                                : isTransfer
                                ? 'text-indigo-400'
                                : 'text-rose-400'
                            }
                          >
                            {isIncome ? '+' : isTransfer ? '' : '-'}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              springPress(e.currentTarget);
                              handleDelete(tx.id);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete entry"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3.5 bg-[#0b0f17] border-t border-[#1f2937] flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, transactions.length)} of {transactions.length}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded bg-[#111827] hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-tabular font-medium text-white">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded bg-[#111827] hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
