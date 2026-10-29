// src/pages/Budgets.tsx
import { BudgetList }      from '../components/budgets/BudgetList';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { MonthPicker }     from '../components/ui/MonthPicker';

export function Budgets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Budgets</h2>
        <MonthPicker />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetList />
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-500">Spending breakdown</h3>
          <CategoryPieChart />
        </div>
      </div>
    </div>
  );
}
