import { NavLink } from 'react-router-dom';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useAccounts }     from '../../hooks/useAccounts';
import { formatCurrency }  from '../../utils/format';

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: '◈' },
  { to: '/transactions', label: 'Transactions', icon: '⇅' },
  { to: '/budgets',      label: 'Budgets',      icon: '◉' },
  { to: '/accounts',     label: 'Accounts',     icon: '◫' },
  { to: '/categories',   label: 'Categories',   icon: '◑' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, selectedAccountId, setSelectedAccountId } = useFinanceStore();
  const { data: accounts = [] } = useAccounts();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-slate-900 text-white flex flex-col z-30 overflow-hidden
      transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
      ${sidebarCollapsed ? 'w-16' : 'w-60'}`}
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0"
               style={{ boxShadow: '0 2px 8px rgba(99,102,241,0.5)' }}>
            <span className="text-white text-sm font-bold">$</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-white tracking-tight whitespace-nowrap animate-fade-up">
              Finance
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-400
                     hover:text-white hover:bg-slate-700 transition-all duration-150 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <span className="text-xs" style={{ transition: 'transform 0.3s', transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>›</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {NAV.map(({ to, label, icon }, i) => (
            <li key={to}>
              <NavLink
                to={to}
                title={sidebarCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="text-base w-5 text-center flex-shrink-0 leading-none">{icon}</span>
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Account switcher */}
        {!sidebarCollapsed && accounts.length > 0 && (
          <div className="mt-5 px-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
              Accounts
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => setSelectedAccountId(null)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150
                    ${selectedAccountId === null
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <span>All accounts</span>
                </button>
              </li>
              {accounts.map((acc) => (
                <li key={acc.id}>
                  <button
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150
                      ${selectedAccountId === acc.id
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: acc.color }} />
                      <span className="truncate">{acc.name}</span>
                    </div>
                    <span className="text-slate-500 ml-1 flex-shrink-0 tabular-nums">
                      {formatCurrency(acc.balance, acc.currency, { compact: true })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom version tag */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-slate-700/50">
          <p className="text-[10px] text-slate-600">Finance Tracker v1.0</p>
        </div>
      )}
    </aside>
  );
}
