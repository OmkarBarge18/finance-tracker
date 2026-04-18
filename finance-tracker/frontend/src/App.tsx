import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar }        from './components/layout/Sidebar';
import { TopBar }         from './components/layout/TopBar';
import { Dashboard }      from './pages/Dashboard';
import { Transactions }   from './pages/Transactions';
import { Budgets }        from './pages/Budgets';
import { Accounts }       from './pages/Accounts';
import { Categories }     from './pages/Categories';
import { ToastProvider }  from './components/ui/Toast';
import { useFinanceStore } from './store/useFinanceStore';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter h-full">
      <Routes location={location}>
        <Route path="/"             element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets"      element={<Budgets />} />
        <Route path="/accounts"     element={<Accounts />} />
        <Route path="/categories"   element={<Categories />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const { sidebarCollapsed } = useFinanceStore();
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Sidebar />
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">
              <AnimatedRoutes />
            </main>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
