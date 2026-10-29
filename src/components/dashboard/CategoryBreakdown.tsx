'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategorySpend } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface CategoryBreakdownProps {
  categories: CategorySpend[];
}

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const totalSpend = categories.reduce((sum, c) => sum + c.total, 0);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1f2937] shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.colour || '#6366f1' }}
            />
            <span>{data.category}</span>
          </p>
          <p className="text-slate-300 font-tabular font-bold">
            {formatCurrency(data.total)} ({data.pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card rounded-xl p-5 border border-[#1f2937] flex flex-col justify-between">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-white tracking-tight">Expense Breakdown</h3>
        <p className="text-xs text-slate-400">Spending allocation by functional category</p>
      </div>

      {categories.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-slate-500">
          No expense transactions recorded in this timeframe
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-3">
          {/* Donut Chart */}
          <div className="sm:col-span-5 h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={2}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.colour || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Net Total */}
            <div className="absolute text-center pointer-events-none">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total</span>
              <span className="text-xs font-bold text-white font-tabular">
                {formatCurrency(totalSpend, 'USD', true)}
              </span>
            </div>
          </div>

          {/* Categories List */}
          <div className="sm:col-span-7 space-y-2 max-h-52 overflow-y-auto pr-1">
            {categories.slice(0, 6).map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.colour || '#6366f1' }}
                    />
                    <span className="text-slate-300 font-medium truncate">{cat.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 font-tabular text-[11px]">
                    <span className="text-white font-semibold">{formatCurrency(cat.total)}</span>
                    <span className="text-slate-400 w-8 text-right">{cat.pct}%</span>
                  </div>
                </div>
                {/* Progress Meter Bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(cat.pct, 100)}%`,
                      backgroundColor: cat.colour || '#6366f1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
