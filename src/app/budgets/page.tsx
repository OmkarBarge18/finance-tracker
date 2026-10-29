'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  Target,
} from 'lucide-react';
import { Budget, Category, SavingsGoal } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { springPress, triggerConfetti, staggerEntrance } from '@/lib/animations';

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-10-01');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Set Budget Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`/api/budgets?month=${selectedMonth}`),
        fetch('/api/categories?type=expense'),
      ]);

      if (bRes.ok) setBudgets(await bRes.json());
      if (cRes.ok) {
        const cats = await cRes.json();
        setCategories(cats);
        if (cats.length > 0) setSelectedCategory(cats[0].id);
      }

      setGoals([
        {
          id: 1,
          name: 'Emergency Fund (6 Months)',
          target_amount: 25000,
          current_amount: 18450,
          target_date: '2026-12-31',
          color: '#10b981',
          icon: 'target',
        },
        {
          id: 2,
          name: 'Annual Travel Reserve',
          target_amount: 6000,
          current_amount: 4200,
          target_date: '2027-04-15',
          color: '#6366f1',
          icon: 'target',
        },
        {
          id: 3,
          name: 'Equipment Replacement',
          target_amount: 3500,
          current_amount: 2800,
          target_date: '2026-11-30',
          color: '#f59e0b',
          icon: 'target',
        },
        {
          id: 4,
          name: 'Index Fund Investment Booster',
          target_amount: 12000,
          current_amount: 7500,
          target_date: '2027-01-01',
          color: '#06b6d4',
          icon: 'target',
        },
      ]);
    } catch (e) {
      console.warn('Budgets fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading) {
      staggerEntrance('.budget-card-item', 0.04);
    }
  }, [loading, budgets]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) return;

    setSaving(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: selectedCategory,
          amount: parseFloat(budgetAmount),
          month: selectedMonth,
        }),
      });

      if (res.ok) {
        triggerConfetti();
        setIsModalOpen(false);
        setBudgetAmount('');
        loadData();
      }
    } catch (e) {
      console.error('Save budget failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const { totalBudgeted, totalSpent, overallPct } = useMemo(() => {
    const budgeted = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const spent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
    return { totalBudgeted: budgeted, totalSpent: spent, overallPct: pct };
  }, [budgets]);

  return (
    <div>
      <Topbar
        title="Budgets & Goals"
        subtitle="Manage spending limits, track savings milestones, and prevent overspending"
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

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Overall Budget Overview Card */}
        <div className="surface-card rounded-xl p-5 sm:p-6 border border-[#1f2937]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">
                Monthly Spending Envelope
              </span>
              <div className="mt-1 flex items-baseline space-x-3">
                <span className="text-2xl sm:text-3xl font-bold text-white font-tabular">
                  {formatCurrency(totalSpent)}
                </span>
                <span className="text-slate-400 text-xs sm:text-sm font-tabular">
                  budgeted {formatCurrency(totalBudgeted)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {totalBudgeted - totalSpent >= 0 ? (
                  <span className="text-emerald-400 font-medium">
                    {formatCurrency(totalBudgeted - totalSpent)} remaining this month
                  </span>
                ) : (
                  <span className="text-rose-400 font-medium">
                    Over budget by {formatCurrency(totalSpent - totalBudgeted)}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={(e) => {
                springPress(e.currentTarget);
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Set Category Budget</span>
            </button>
          </div>

          {/* Progress Gauge */}
          <div className="mt-4 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                overallPct > 100
                  ? 'bg-rose-500'
                  : overallPct > 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(overallPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-1.5 font-tabular">
            <span>{overallPct}% consumed</span>
            <span>{Math.max(0, 100 - overallPct)}% remaining</span>
          </div>
        </div>

        {/* Category Budgets Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Category Envelopes</h3>
              <p className="text-xs text-slate-400">Expense pacing against monthly limits</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="surface-card rounded-xl p-4 border border-[#1f2937] animate-pulse h-32 flex flex-col justify-between">
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                  <div className="h-2 bg-slate-800 rounded-full" />
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <div className="surface-card rounded-xl p-10 text-center border border-[#1f2937]">
              <p className="text-xs text-slate-400">
                No category limits defined for this month yet.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-semibold"
              >
                + Define First Category Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((b) => {
                const spent = b.spent || 0;
                const budgeted = b.amount || 0;
                const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
                const isOver = pct > 100;
                const isNear = pct >= 80 && pct <= 100;

                return (
                  <div
                    key={b.id}
                    className="budget-card-item surface-card rounded-xl p-4 border border-[#1f2937] hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.category_colour || '#6366f1' }}
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-white">
                            {b.category_name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-tabular">
                            {formatCurrency(budgeted)} allocated
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isOver ? (
                        <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-900/40">
                          Over
                        </span>
                      ) : isNear ? (
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/40 font-tabular">
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/40">
                          Normal
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : isNear ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs font-tabular">
                      <span className="text-slate-400 text-[11px]">
                        Spent: <span className="font-semibold text-white">{formatCurrency(spent)}</span>
                      </span>
                      <span className={`text-[11px] ${isOver ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                        {isOver
                          ? `-${formatCurrency(spent - budgeted)}`
                          : `${formatCurrency(budgeted - spent)} left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Savings Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Savings Goals</h3>
              <p className="text-xs text-slate-400">Capital accumulation targets & reserves</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {goals.map((g) => {
              const pct = Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100);
              return (
                <div
                  key={g.id}
                  className="budget-card-item surface-card rounded-xl p-4 border border-[#1f2937]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-slate-300">
                      <Target className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-tabular text-emerald-400 font-semibold bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/40">
                      {pct}%
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-1">{g.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Target {formatDate(g.target_date)}</p>

                  <div className="mt-3 flex items-baseline justify-between font-tabular">
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(g.current_amount, 'USD', true)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      / {formatCurrency(g.target_amount, 'USD', true)}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: g.color || '#10b981' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] rounded-xl p-5 w-full max-w-sm border border-[#1f2937]">
            <h3 className="text-sm font-bold text-white mb-0.5">Set Category Envelope</h3>
            <p className="text-xs text-slate-400 mb-3">
              Allocate a monthly spending ceiling for this category.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Budget Limit ($)
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 500"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full surface-input px-3 py-2 rounded-lg text-xs font-tabular"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
