'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Topbar from '@/components/layout/Topbar';
import AnimatedStatCard from '@/components/dashboard/AnimatedStatCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SavingsGoalsCard from '@/components/dashboard/SavingsGoalsCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
} from 'lucide-react';
import { Account, Transaction, MonthlyAnalytics, CategorySpend, SavingsGoal } from '@/lib/types';
import { staggerEntrance } from '@/lib/animations';

const CashFlowChart = dynamic(() => import('@/components/dashboard/CashFlowChart'), {
  ssr: false,
  loading: () => (
    <div className="surface-card rounded-xl p-5 border border-[#1f2937] h-80 flex flex-col justify-between animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
      <div className="h-56 bg-slate-800/40 rounded-lg" />
    </div>
  ),
});

const CategoryBreakdown = dynamic(() => import('@/components/dashboard/CategoryBreakdown'), {
  ssr: false,
  loading: () => (
    <div className="surface-card rounded-xl p-5 border border-[#1f2937] h-80 flex flex-col justify-between animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
      <div className="h-56 bg-slate-800/40 rounded-lg" />
    </div>
  ),
});

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-10-01');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategorySpend[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const year = new Date(selectedMonth).getFullYear() || 2026;
      const [accRes, txRes, anaRes, dbRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/transactions?limit=10'),
        fetch(`/api/analytics?year=${year}`),
        fetch('/api/db-status'),
      ]);

      if (accRes.ok) setAccounts(await accRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (anaRes.ok) {
        const ana = await anaRes.json();
        setMonthlyData(ana.monthly || []);
        setCategoriesData(ana.categories || []);
      }
      if (dbRes.ok) {
        const dbStatus = await dbRes.json();
        setIsDbConnected(dbStatus.connected);
      }

      setGoals([
        {
          id: 1,
          name: 'Emergency Fund',
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
      ]);
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();

    const handleRefresh = () => fetchData();
    window.addEventListener('finance:transaction-created', handleRefresh);
    window.addEventListener('finance:data-refreshed', handleRefresh);

    return () => {
      window.removeEventListener('finance:transaction-created', handleRefresh);
      window.removeEventListener('finance:data-refreshed', handleRefresh);
    };
  }, [fetchData]);

  useEffect(() => {
    if (!loading) {
      staggerEntrance('.stagger-card', 0.04);
    }
  }, [loading]);

  const handleDeleteTransaction = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Delete transaction failed:', e);
    }
  }, [fetchData]);

  // Memoized calculations
  const netWorth = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const selectedMonthNum = useMemo(() => {
    return parseInt(selectedMonth.split('-')[1]) || 10;
  }, [selectedMonth]);

  const currentMonthAnalytics = useMemo(() => {
    return (
      monthlyData.find((m) => m.month === selectedMonthNum) || {
        month: selectedMonthNum,
        month_name: 'Oct',
        income: 5350,
        expenses: 1946.09,
        net: 3403.91,
        savings_rate: 64,
      }
    );
  }, [monthlyData, selectedMonthNum]);

  // Real month-over-month delta calculation (not fabricated)
  const previousMonthAnalytics = useMemo(() => {
    const prevMonthNum = selectedMonthNum > 1 ? selectedMonthNum - 1 : 12;
    return monthlyData.find((m) => m.month === prevMonthNum);
  }, [monthlyData, selectedMonthNum]);

  const incomeDelta = useMemo(() => {
    if (!previousMonthAnalytics || previousMonthAnalytics.income === 0) return null;
    const diff = currentMonthAnalytics.income - previousMonthAnalytics.income;
    const pct = Math.round((diff / previousMonthAnalytics.income) * 100);
    return {
      value: Math.abs(pct),
      isPositive: pct >= 0,
      label: 'vs prior month',
    };
  }, [currentMonthAnalytics, previousMonthAnalytics]);

  const expenseDelta = useMemo(() => {
    if (!previousMonthAnalytics || previousMonthAnalytics.expenses === 0) return null;
    const diff = currentMonthAnalytics.expenses - previousMonthAnalytics.expenses;
    const pct = Math.round((diff / previousMonthAnalytics.expenses) * 100);
    return {
      value: Math.abs(pct),
      isPositive: pct <= 0,
      label: 'vs prior month',
    };
  }, [currentMonthAnalytics, previousMonthAnalytics]);

  const selectedYear = useMemo(() => {
    return new Date(selectedMonth).getFullYear() || 2026;
  }, [selectedMonth]);

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Real-time wealth tracking & analytics"
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
        isDbConnected={isDbConnected}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* KPI Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stagger-card">
            <AnimatedStatCard
              title="Net Worth"
              value={netWorth}
              colorScheme="emerald"
              icon={Wallet}
              trend={
                accounts.length > 0
                  ? {
                      value: accounts.length,
                      isPositive: true,
                      label: `${accounts.length} linked accounts`,
                    }
                  : undefined
              }
            />
          </div>

          <div className="stagger-card">
            <AnimatedStatCard
              title="Monthly Inflow"
              value={currentMonthAnalytics.income}
              colorScheme="emerald"
              icon={TrendingUp}
              trend={incomeDelta || undefined}
            />
          </div>

          <div className="stagger-card">
            <AnimatedStatCard
              title="Monthly Outflow"
              value={currentMonthAnalytics.expenses}
              colorScheme="rose"
              icon={TrendingDown}
              trend={expenseDelta || undefined}
            />
          </div>

          <div className="stagger-card">
            <AnimatedStatCard
              title="Savings Rate"
              value={currentMonthAnalytics.savings_rate}
              prefix=""
              decimals={0}
              colorScheme="indigo"
              icon={Percent}
              trend={{
                value: Math.round(currentMonthAnalytics.net),
                isPositive: currentMonthAnalytics.net >= 0,
                label: 'net saved',
              }}
            />
          </div>
        </div>

        {/* Cash Flow Dynamics & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 stagger-card">
            <CashFlowChart data={monthlyData} year={selectedYear} />
          </div>
          <div className="lg:col-span-5 stagger-card">
            <CategoryBreakdown categories={categoriesData} />
          </div>
        </div>

        {/* Recent Transactions & Savings Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 stagger-card">
            <RecentTransactions
              transactions={transactions}
              onDelete={handleDeleteTransaction}
            />
          </div>
          <div className="lg:col-span-5 stagger-card">
            <SavingsGoalsCard goals={goals} />
          </div>
        </div>
      </div>
    </div>
  );
}
