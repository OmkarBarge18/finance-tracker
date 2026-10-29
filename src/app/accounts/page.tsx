'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Wallet,
  Plus,
  ArrowLeftRight,
  Trash2,
  CreditCard,
  Building,
  Landmark,
  Coins,
} from 'lucide-react';
import { Account } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { springPress, triggerConfetti, staggerEntrance } from '@/lib/animations';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Account Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('checking');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  // Transfer Modal
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState<number>(1);
  const [toAccountId, setToAccountId] = useState<number>(2);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
        if (data.length >= 2) {
          setFromAccountId(data[0].id);
          setToAccountId(data[1].id);
        }
      }
    } catch (e) {
      console.warn('Load accounts failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (!loading) {
      staggerEntrance('.account-card-item', 0.04);
    }
  }, [loading, accounts]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || balance === '') return;

    setSaving(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          balance: parseFloat(balance),
          currency,
          color,
        }),
      });

      if (res.ok) {
        triggerConfetti();
        setIsAddOpen(false);
        setName('');
        setBalance('');
        loadAccounts();
      }
    } catch (e) {
      console.error('Create account failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0 || fromAccountId === toAccountId) return;

    setTransferring(true);
    try {
      const fromAcc = accounts.find((a) => a.id === fromAccountId);
      const toAcc = accounts.find((a) => a.id === toAccountId);

      await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: [
            {
              account_id: fromAccountId,
              amount: amt,
              type: 'expense',
              description: `Transfer to ${toAcc?.name || 'Account'}`,
              date: new Date().toISOString().split('T')[0],
              notes: 'Account Transfer',
            },
            {
              account_id: toAccountId,
              amount: amt,
              type: 'income',
              description: `Transfer from ${fromAcc?.name || 'Account'}`,
              date: new Date().toISOString().split('T')[0],
              notes: 'Account Transfer',
            },
          ],
        }),
      });

      triggerConfetti();
      setIsTransferOpen(false);
      setTransferAmount('');
      loadAccounts();
    } catch (e) {
      console.error('Transfer failed:', e);
    } finally {
      setTransferring(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Are you sure you want to remove this account?')) return;
    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error('Delete account failed:', e);
    }
  };

  const netWorth = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const getAccountIcon = (t: Account['type']) => {
    switch (t) {
      case 'credit':
        return CreditCard;
      case 'savings':
        return Landmark;
      case 'investment':
        return Building;
      case 'cash':
        return Coins;
      default:
        return Wallet;
    }
  };

  return (
    <div>
      <Topbar
        title="Accounts & Liquidity"
        subtitle="Track cash balances, credit cards, investment portfolios, and transfers"
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
        selectedMonth="2026-10-01"
        onMonthChange={() => {}}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Summary Banner */}
        <div className="surface-card rounded-xl p-5 sm:p-6 border border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">
              Total Managed Liquidity
            </span>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-bold text-white font-tabular">
                {loading ? (
                  <div className="h-8 bg-slate-800 rounded w-32 animate-pulse" />
                ) : (
                  formatCurrency(netWorth)
                )}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ({accounts.length} active accounts)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={(e) => {
                springPress(e.currentTarget);
                setIsTransferOpen(true);
              }}
              disabled={accounts.length < 2}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0b0f17] hover:bg-slate-800 border border-[#1f2937] text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-40"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Transfer</span>
            </button>
            <button
              onClick={(e) => {
                springPress(e.currentTarget);
                setIsAddOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Account</span>
            </button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl p-5 bg-[#0f172a] border border-[#1f2937] animate-pulse h-40 flex flex-col justify-between">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-800 rounded w-1/4" />
              </div>
            ))
          ) : (
            accounts.map((acc) => {
              const Icon = getAccountIcon(acc.type);
              const isNegative = acc.balance < 0;

              return (
                <div
                  key={acc.id}
                  className="account-card-item rounded-xl p-5 bg-[#111827] border border-[#1f2937] hover:border-slate-600 transition-colors flex flex-col justify-between h-44 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-[#0b0f17] border border-[#1f2937] text-slate-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white tracking-tight">{acc.name}</h4>
                        <span className="text-[10px] uppercase font-medium text-slate-400 tracking-wider">
                          {acc.type} • {acc.currency}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                      title="Delete Account"
                      aria-label="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-medium text-slate-400 tracking-wider block">
                      Balance
                    </span>
                    <span
                      className={`text-xl sm:text-2xl font-bold font-tabular tracking-tight ${
                        isNegative ? 'text-rose-400' : 'text-white'
                      }`}
                    >
                      {formatCurrency(acc.balance, acc.currency)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#1f2937] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Active Account</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] rounded-xl p-5 w-full max-w-sm border border-[#1f2937]">
            <h3 className="text-sm font-bold text-white mb-0.5">Add Account</h3>
            <p className="text-xs text-slate-400 mb-3">
              Add a banking, credit card, or investment balance.
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Checking"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full surface-input px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <option value="checking" className="bg-slate-900">Checking</option>
                    <option value="savings" className="bg-slate-900">Savings</option>
                    <option value="credit" className="bg-slate-900">Credit Card</option>
                    <option value="investment" className="bg-slate-900">Investment</option>
                    <option value="cash" className="bg-slate-900">Cash Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full surface-input px-2.5 py-1.5 rounded-lg text-xs font-tabular"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] rounded-xl p-5 w-full max-w-sm border border-[#1f2937]">
            <h3 className="text-sm font-bold text-white mb-0.5">Transfer Funds</h3>
            <p className="text-xs text-slate-400 mb-3">
              Move capital between internal accounts.
            </p>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">From Account</label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(parseInt(e.target.value))}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-slate-900">
                      {a.name} (${a.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(parseInt(e.target.value))}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-slate-900">
                      {a.name} (${a.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Transfer Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs font-tabular"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  {transferring ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
