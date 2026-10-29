import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCategorySpend } from '../../hooks/useTransactions';
import { useFinanceStore }  from '../../store/useFinanceStore';
import { formatCurrency, formatPct } from '../../utils/format';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function CategoryPieChart() {
  const { activeMonth, selectedAccountId } = useFinanceStore();
  const monthDate = new Date(activeMonth + 'T00:00:00');
  const { data = [], isLoading } = useCategorySpend({
    date_from:  format(startOfMonth(monthDate), 'yyyy-MM-dd'),
    date_to:    format(endOfMonth(monthDate),   'yyyy-MM-dd'),
    account_id: selectedAccountId ?? undefined,
  });

  if (isLoading) return <div className="card p-6 h-72 animate-pulse bg-slate-100 rounded-xl" />;
  if (!data.length) return (
    <div className="card p-6 flex items-center justify-center h-72 text-slate-400 text-sm">
      No expense data for this month
    </div>
  );

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Spending by category</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((entry, i) => <Cell key={i} fill={entry.colour} />)}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value, entry: any) => `${value} (${formatPct(entry.payload?.pct ?? 0)})`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
