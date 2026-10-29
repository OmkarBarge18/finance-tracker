'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { MonthlyAnalytics } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, LineChart } from 'lucide-react';

interface CashFlowChartProps {
  data: MonthlyAnalytics[];
  year: number;
}

export default function CashFlowChart({ data, year }: CashFlowChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] p-3 rounded-lg border border-[#1f2937] shadow-xl text-xs space-y-1.5 min-w-[130px]">
          <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1">
            {label} {year}
          </p>
          <p className="text-emerald-400 font-medium flex justify-between">
            <span>Income:</span>
            <span className="font-tabular font-bold">{formatCurrency(payload[0]?.value || 0)}</span>
          </p>
          <p className="text-rose-400 font-medium flex justify-between">
            <span>Expenses:</span>
            <span className="font-tabular font-bold">{formatCurrency(payload[1]?.value || 0)}</span>
          </p>
          {payload[0] && payload[1] && (
            <p className="text-slate-300 font-medium flex justify-between pt-1 border-t border-slate-800">
              <span>Net:</span>
              <span className="font-tabular font-bold">
                {formatCurrency((payload[0].value || 0) - (payload[1].value || 0))}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card rounded-xl p-5 border border-[#1f2937]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Cash Flow Dynamics</h3>
          <p className="text-xs text-slate-400">Monthly earned revenue vs expense burn rate</p>
        </div>

        {/* Toggle Chart Type */}
        <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-[#0b0f17] border border-[#1f2937] text-xs">
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded transition-colors ${
              chartType === 'area'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Area Curve"
            aria-label="Area Curve"
          >
            <LineChart className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded transition-colors ${
              chartType === 'bar'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Bar Columns"
            aria-label="Bar Columns"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month_name" stroke="#64748b" tickLine={false} fontSize={11} />
              <YAxis
                stroke="#64748b"
                tickLine={false}
                fontSize={11}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month_name" stroke="#64748b" tickLine={false} fontSize={11} />
              <YAxis
                stroke="#64748b"
                tickLine={false}
                fontSize={11}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expenses" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
