'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Plus,
  Clock,
  CalendarClock,
} from 'lucide-react';
import { RecurringBill, Category, Account } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { springPress, triggerConfetti, staggerEntrance } from '@/lib/animations';

export default function RecurringPage() {
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Recurring Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [accountId, setAccountId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, cRes, aRes] = await Promise.all([
        fetch('/api/recurring'),
        fetch('/api/categories?type=expense'),
        fetch('/api/accounts'),
      ]);

      if (rRes.ok) setBills(await rRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (aRes.ok) setAccounts(await aRes.json());
    } catch (e) {
      console.warn('Load recurring failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  useEffect(() => {
    if (!loading) {
      staggerEntrance('.recurring-card-item', 0.04);
    }
  }, [loading, bills]);

  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !nextDueDate) return;

    setSaving(true);
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          frequency,
          next_due_date: nextDueDate,
          category_id: categoryId || null,
          account_id: accountId || null,
          status: 'active',
        }),
      });

      if (res.ok) {
        triggerConfetti();
        setIsAddOpen(false);
        setName('');
        setAmount('');
        setNextDueDate('');
        loadBills();
      }
    } catch (e) {
      console.error('Create recurring failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const { monthlyTotal, yearlyTotal, activeCount } = useMemo(() => {
    const monthly = bills.reduce((sum, b) => {
      if (b.status === 'paused') return sum;
      return sum + (b.frequency === 'yearly' ? b.amount / 12 : b.amount);
    }, 0);
    return {
      monthlyTotal: monthly,
      yearlyTotal: monthly * 12,
      activeCount: bills.filter((b) => b.status === 'active').length,
    };
  }, [bills]);

  return (
    <div>
      <Topbar
        title="Subscriptions & Bills"
        subtitle="Track recurring memberships, cloud services, and upcoming fixed obligations"
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
        {/* KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-card rounded-xl p-5 border border-[#1f2937]">
            <span className="text-xs uppercase font-medium text-slate-400">Monthly Run-rate</span>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-white font-tabular">
              {loading ? (
                <div className="h-8 bg-slate-800 rounded w-28 animate-pulse" />
              ) : (
                formatCurrency(monthlyTotal)
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Sum of all monthly active recurring charges</p>
          </div>

          <div className="surface-card rounded-xl p-5 border border-[#1f2937]">
            <span className="text-xs uppercase font-medium text-slate-400">Annual Run-rate</span>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-slate-200 font-tabular">
              {loading ? (
                <div className="h-8 bg-slate-800 rounded w-28 animate-pulse" />
              ) : (
                formatCurrency(yearlyTotal)
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">12-month projected subscription cost</p>
          </div>

          <div className="surface-card rounded-xl p-5 border border-[#1f2937] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-medium text-slate-400">Active Subscriptions</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-900/40">
                {activeCount} Active
              </span>
            </div>
            <button
              onClick={(e) => {
                springPress(e.currentTarget);
                setIsAddOpen(true);
              }}
              className="mt-3 flex items-center justify-center space-x-1.5 w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="surface-card rounded-xl p-4 border border-[#1f2937] animate-pulse h-32 flex flex-col justify-between">
                <div className="h-4 bg-slate-800 rounded w-1/2" />
                <div className="h-4 bg-slate-800 rounded w-1/3" />
              </div>
            ))
          ) : (
            bills.map((bill) => (
              <div
                key={bill.id}
                className="recurring-card-item surface-card rounded-xl p-4 border border-[#1f2937] hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0b0f17] border border-[#1f2937] flex items-center justify-center text-slate-400">
                      <CalendarClock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">
                        {bill.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {bill.frequency} billing
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-white font-tabular">
                    {formatCurrency(bill.amount)}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1f2937] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Due {formatDate(bill.next_due_date)}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/30 text-emerald-400 border border-emerald-900/40">
                    Active
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Recurring Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] rounded-xl p-5 w-full max-w-sm border border-[#1f2937]">
            <h3 className="text-sm font-bold text-white mb-0.5">Add Recurring Obligation</h3>
            <p className="text-xs text-slate-400 mb-3">
              Track periodic subscriptions, utilities, and memberships.
            </p>

            <form onSubmit={handleCreateRecurring} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service / Obligation Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Hosting or Office Lease"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full surface-input px-2.5 py-1.5 rounded-lg text-xs font-tabular"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full surface-input px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <option value="monthly" className="bg-slate-900">Monthly</option>
                    <option value="yearly" className="bg-slate-900">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Next Billing Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs font-tabular"
                  required
                />
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
                  {saving ? 'Adding...' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
