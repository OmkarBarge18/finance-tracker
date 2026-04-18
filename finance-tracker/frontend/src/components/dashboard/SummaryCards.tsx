import { useAccounts }       from '../../hooks/useAccounts';
import { useMonthlySummary } from '../../hooks/useTransactions';
import { useFinanceStore }   from '../../store/useFinanceStore';
import { formatCurrency }    from '../../utils/format';

export function SummaryCards() {
  const { selectedAccountId, analyticsYear } = useFinanceStore();
  const { data: accounts = [] }  = useAccounts();
  const { data: monthly = [] }   = useMonthlySummary(analyticsYear, selectedAccountId ?? undefined);

  const netWorth = selectedAccountId
    ? (accounts.find(a => a.id === selectedAccountId)?.balance ?? 0)
    : accounts.reduce((s, a) => s + a.balance, 0);

  const currentMonth = new Date().getMonth() + 1;
  const thisMonth    = monthly.find(m => m.month === currentMonth);
  const income   = thisMonth?.income   ?? 0;
  const expenses = thisMonth?.expenses ?? 0;
  const net      = income - expenses;

  const cards = [
    { label: 'Net worth',           value: formatCurrency(netWorth), sub: `${accounts.length} account${accounts.length !== 1 ? 's' : ''}`, color: 'text-indigo-600' },
    { label: 'Income this month',   value: formatCurrency(income),   sub: 'Total received',                                                 color: 'text-emerald-600' },
    { label: 'Expenses this month', value: formatCurrency(expenses), sub: 'Total spent',                                                    color: 'text-red-500' },
    { label: 'Net this month',      value: formatCurrency(net, 'USD', { showSign: true }), sub: net >= 0 ? 'Surplus' : 'Deficit',           color: net >= 0 ? 'text-emerald-600' : 'text-red-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, color }) => (
        <div key={label} className="stat-card">
          <span className="stat-label">{label}</span>
          <span className={`stat-value ${color}`}>{value}</span>
          <span className="text-xs text-slate-400">{sub}</span>
        </div>
      ))}
    </div>
  );
}
