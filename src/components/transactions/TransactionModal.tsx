'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check } from 'lucide-react';
import { Account, Category, Transaction, TransactionType } from '@/lib/types';
import { springPress, triggerConfetti } from '@/lib/animations';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTx: Transaction) => void;
  accounts: Account[];
  categories: Category[];
  initialData?: Partial<Transaction> | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  categories,
  initialData,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<number>(accounts[0]?.id || 1);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setAccountId(initialData.account_id || accounts[0]?.id || 1);
      setCategoryId(initialData.category_id || '');
      setDescription(initialData.description || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setAccountId(accounts[0]?.id || 1);
      setCategoryId('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [initialData, accounts]);

  const filteredCategories = categories.filter((c) =>
    type === 'transfer' ? false : c.type === type
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    if (!accountId) {
      setError('Please select an account');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          category_id: categoryId || null,
          amount: parseFloat(amount),
          type,
          description: description || (type === 'income' ? 'Income' : 'Expense'),
          date,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save transaction');
      }

      const createdTx = await res.json();
      triggerConfetti();
      onSuccess(createdTx);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-xl p-6 shadow-2xl border border-[#1f2937] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2937]">
          <div>
            <h3 className="text-base font-bold text-white">Record Transaction</h3>
            <p className="text-xs text-slate-400">Ledger entry synced with database</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3.5 p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#0b0f17] border border-[#1f2937]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                type === 'expense'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                type === 'income'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                type === 'transfer'
                  ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full surface-input text-xl font-bold text-white rounded-lg py-2.5 pl-8 pr-3 font-tabular"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Account & Category Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(parseInt(e.target.value))}
                className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900">
                    {acc.name} (${acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {type !== 'transfer' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    -- Select Category --
                  </option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Description & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Groceries or Cloud Hosting"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full surface-input px-3 py-2 rounded-lg text-xs font-tabular"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Memo, invoice reference, or receipt tag..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full surface-input px-3 py-2 rounded-lg text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1f2937]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => springPress(e.currentTarget)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Saving...' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
