'use client';

import React from 'react';
import { Target, ChevronRight } from 'lucide-react';
import { SavingsGoal } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface SavingsGoalsCardProps {
  goals: SavingsGoal[];
}

export default function SavingsGoalsCard({ goals }: SavingsGoalsCardProps) {
  return (
    <div className="surface-card rounded-xl p-5 border border-[#1f2937]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Savings Goals</h3>
          <p className="text-xs text-slate-400">Target milestones & capital progress</p>
        </div>
        <Link
          href="/budgets"
          className="flex items-center space-x-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {goals.map((g) => {
          const pct = Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100);
          return (
            <div key={g.id} className="p-3 rounded-lg bg-[#0b0f17] border border-[#1f2937]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{g.name}</h4>
                    <span className="text-[10px] text-slate-400">Target {formatDate(g.target_date)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-tabular text-xs font-bold text-emerald-400">
                    {formatCurrency(g.current_amount, 'USD', true)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-tabular">
                    of {formatCurrency(g.target_amount, 'USD', true)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: g.color || '#10b981',
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-tabular">
                <span>{pct}% funded</span>
                <span>{formatCurrency(Math.max(0, g.target_amount - g.current_amount), 'USD', true)} remaining</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
