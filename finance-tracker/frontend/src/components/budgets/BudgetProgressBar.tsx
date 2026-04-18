// src/components/budgets/BudgetProgressBar.tsx
import { formatCurrency, budgetStatusColor } from '../../utils/format';
import type { BudgetProgress } from '../../types';

interface Props {
  budget:   BudgetProgress;
  onDelete?: (id: number) => void;
}

export function BudgetProgressBar({ budget, onDelete }: Props) {
  const pct         = Math.min(budget.pct, 100);
  const isOver      = budget.pct >= 100;
  const isWarning   = budget.pct >= 80 && budget.pct < 100;
  const barColor    = budgetStatusColor(budget.pct);
  const remaining   = budget.remaining;

  return (
    <div className="p-4 border-b border-slate-50 last:border-0 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: budget.colour }}
          />
          <span className="text-sm font-medium text-slate-700">{budget.category}</span>
          {isOver    && <span className="badge bg-red-100 text-red-600 text-xs">Over budget</span>}
          {isWarning && <span className="badge bg-amber-100 text-amber-600 text-xs">Near limit</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 tabular-nums">
            {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(budget.budget_id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost p-1 text-xs text-red-400 hover:text-red-600"
            >✕</button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full budget-bar ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-slate-400">{budget.pct.toFixed(1)}% used</span>
        <span className={`text-xs font-medium ${remaining < 0 ? 'text-red-500' : 'text-slate-500'}`}>
          {remaining >= 0
            ? `${formatCurrency(remaining)} left`
            : `${formatCurrency(Math.abs(remaining))} over`
          }
        </span>
      </div>
    </div>
  );
}
