'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { MonthlyAnalytics, CategorySpend } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { staggerEntrance } from '@/lib/animations';

export default function AnalyticsPage() {
  const [year, setYear] = useState(2026);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics[]>([]);
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlyData(data.monthly || []);
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.warn('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (!loading) {
      staggerEntrance('.analytics-card-item', 0.05);
    }
  }, [loading]);

  const { totalIncome, totalExpense, netSavings, avgSavingsRate } = useMemo(() => {
    const inc = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const exp = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const net = inc - exp;
    const rate = inc > 0 ? Math.round((net / inc) * 100) : 0;
    return {
      totalIncome: inc,
      totalExpense: exp,
      netSavings: net,
      avgSavingsRate: rate,
    };
  }, [monthlyData]);

  return (
    <div>
      <Topbar
        title="Analytics & Trends"
        subtitle="Long-term cashflow dynamics, savings rate velocity, and category distribution"
        onOpenQuickAdd={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
        }}
        onOpenCsvImport={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
        }}
        onOpenDbModal={() => {}}
        isDbConnected={true}
        selectedMonth="2026-10-01"
        onMonthChange={() => {}}
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Year Selector */}
        <div className="flex items-center space-x-2">
          {[2025, 2026, 2027].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                year === y
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'glass-card hover:bg-slate-800 text-slate-300'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* 4 Financial Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="analytics-card-item glass-card rounded-2xl p-5 border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400">Total {year} Income</span>
            <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono">
              {loading ? (
                <div className="h-7 bg-slate-800 rounded w-24 animate-pulse mt-1" />
              ) : (
                formatCurrency(totalIncome)
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cumulative inflow across all accounts</p>
          </div>

          <div className="analytics-card-item glass-card rounded-2xl p-5 border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400">Total {year} Expenses</span>
            <div className="mt-2 text-2xl font-extrabold text-rose-400 font-mono">
              {loading ? (
                <div className="h-7 bg-slate-800 rounded w-24 animate-pulse mt-1" />
              ) : (
                formatCurrency(totalExpense)
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cumulative outflow across categories</p>
          </div>

          <div className="analytics-card-item glass-card rounded-2xl p-5 border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400">Net Accumulated</span>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {loading ? (
                <div className="h-7 bg-slate-800 rounded w-24 animate-pulse mt-1" />
              ) : (
                formatCurrency(netSavings)
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Inflow minus outflow for the year</p>
          </div>

          <div className="analytics-card-item glass-card rounded-2xl p-5 border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400">Average Savings Rate</span>
            <div className="mt-2 text-2xl font-extrabold text-indigo-400 font-mono">
              {loading ? (
                <div className="h-7 bg-slate-800 rounded w-16 animate-pulse mt-1" />
              ) : (
                `${avgSavingsRate}%`
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Target is 50%+ for rapid financial freedom</p>
          </div>
        </div>

        {/* Savings Rate Velocity Line Chart */}
        <div className="analytics-card-item glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Savings Velocity Trend (% by Month)</h3>
              <p className="text-xs text-slate-400">Percentage of monthly earned income saved</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full bg-slate-900/50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month_name" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-panel p-2.5 rounded-xl border border-slate-700 text-xs">
                            <p className="font-bold text-white mb-1">{label} {year}</p>
                            <p className="text-indigo-400 font-mono">
                              Savings Rate: {payload[0]?.value}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="savings_rate"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#818cf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Net Savings Bar Chart */}
        <div className="analytics-card-item glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Net Savings Surplus ($)</h3>
              <p className="text-xs text-slate-400">Net capital added or drawn down each month</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full bg-slate-900/50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month_name" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const val = payload[0]?.value as number;
                        return (
                          <div className="glass-panel p-2.5 rounded-xl border border-slate-700 text-xs">
                            <p className="font-bold text-white mb-1">{label} {year}</p>
                            <p className={`font-mono font-bold ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {val >= 0 ? '+' : ''}{formatCurrency(val)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="net"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
