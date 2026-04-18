// src/pages/Dashboard.tsx
import { SummaryCards }     from '../components/dashboard/SummaryCards';
import { SpendingChart }    from '../components/dashboard/SpendingChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { BudgetList }       from '../components/budgets/BudgetList';
import { MonthPicker }      from '../components/ui/MonthPicker';
import { useFinanceStore }  from '../store/useFinanceStore';

export function Dashboard() {
  const { analyticsYear, setAnalyticsYear } = useFinanceStore();

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <SummaryCards />

      {/* Charts row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Income vs Expenses</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnalyticsYear(analyticsYear - 1)}
            className="btn-ghost px-2 py-1"
          >‹</button>
          <span className="text-sm font-medium text-slate-700 w-12 text-center">{analyticsYear}</span>
          <button
            onClick={() => setAnalyticsYear(analyticsYear + 1)}
            className="btn-ghost px-2 py-1"
          >›</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SpendingChart />
        </div>
        <CategoryPieChart />
      </div>

      {/* Budgets */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Budgets</h2>
        <MonthPicker />
      </div>
      <BudgetList />
    </div>
  );
}
