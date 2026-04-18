import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard', '/transactions': 'Transactions',
  '/budgets': 'Budgets', '/accounts': 'Accounts',
};

export function TopBar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'Finance Tracker';
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      <span className="text-sm text-slate-400">{now}</span>
    </header>
  );
}
