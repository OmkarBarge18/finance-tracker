import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMonthlySummary } from '../../hooks/useTransactions';
import { useFinanceStore }   from '../../store/useFinanceStore';
import { monthShort, formatCurrency } from '../../utils/format';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-medium text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function SpendingChart() {
  const { analyticsYear, selectedAccountId } = useFinanceStore();
  const { data = [], isLoading } = useMonthlySummary(analyticsYear, selectedAccountId ?? undefined);

  if (isLoading) return <div className="card p-6 h-72 animate-pulse bg-slate-100 rounded-xl" />;

  const chartData = data.map(r => ({ month: monthShort(r.month), income: r.income, expenses: r.expenses }));

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Income vs Expenses</h2>
        <span className="text-xs text-slate-400">{analyticsYear}</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Area type="monotone" dataKey="income"   name="income"   stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)"  dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} />
          <Area type="monotone" dataKey="expenses" name="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
