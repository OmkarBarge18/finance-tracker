'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  UploadCloud,
  Database,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  CalendarClock,
  TrendingUp,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAdd: () => void;
  onOpenCsvImport: () => void;
  onOpenDbModal: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenQuickAdd,
  onOpenCsvImport,
  onOpenDbModal,
}: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      title: 'New Transaction',
      subtitle: 'Record income, expense or transfer',
      icon: Plus,
      action: () => {
        onClose();
        onOpenQuickAdd();
      },
      category: 'Actions',
    },
    {
      title: 'Import Bank Statement (CSV)',
      subtitle: 'Upload bank statement and auto-map columns',
      icon: UploadCloud,
      action: () => {
        onClose();
        onOpenCsvImport();
      },
      category: 'Actions',
    },
    {
      title: 'PostgreSQL Database Settings',
      subtitle: 'Configure host, port, user and test connection',
      icon: Database,
      action: () => {
        onClose();
        onOpenDbModal();
      },
      category: 'Actions',
    },
    {
      title: 'Dashboard',
      subtitle: 'Overview of net worth, cash flow & recent activity',
      icon: LayoutDashboard,
      action: () => {
        onClose();
        router.push('/');
      },
      category: 'Navigation',
    },
    {
      title: 'Transactions',
      subtitle: 'Complete searchable ledger & CSV export',
      icon: ArrowLeftRight,
      action: () => {
        onClose();
        router.push('/transactions');
      },
      category: 'Navigation',
    },
    {
      title: 'Budgets & Goals',
      subtitle: 'Monthly category limits and target milestones',
      icon: PieChart,
      action: () => {
        onClose();
        router.push('/budgets');
      },
      category: 'Navigation',
    },
    {
      title: 'Accounts',
      subtitle: 'Manage liquidity, cards, and fund transfers',
      icon: Wallet,
      action: () => {
        onClose();
        router.push('/accounts');
      },
      category: 'Navigation',
    },
    {
      title: 'Subscriptions',
      subtitle: 'Recurring bills and monthly projection',
      icon: CalendarClock,
      action: () => {
        onClose();
        router.push('/recurring');
      },
      category: 'Navigation',
    },
    {
      title: 'Analytics',
      subtitle: 'Multi-year trends and savings velocity',
      icon: TrendingUp,
      action: () => {
        onClose();
        router.push('/analytics');
      },
      category: 'Navigation',
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-xl shadow-2xl border border-[#1f2937] overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-3.5 py-3 border-b border-[#1f2937]">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Type a command or jump to page..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands or destinations found.
            </div>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-800/60 border border-transparent hover:border-slate-700/40 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 flex-shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
