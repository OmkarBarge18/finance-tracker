'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  CalendarClock,
  TrendingUp,
  Database,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { springPress } from '@/lib/animations';

interface SidebarProps {
  onOpenQuickAdd: () => void;
  onOpenDbModal: () => void;
  isDbConnected: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  onOpenQuickAdd,
  onOpenDbModal,
  isDbConnected,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { label: 'Budgets & Goals', href: '/budgets', icon: PieChart },
    { label: 'Accounts', href: '/accounts', icon: Wallet },
    { label: 'Subscriptions', href: '/recurring', icon: CalendarClock },
    { label: 'Analytics', href: '/analytics', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-[#0f172a] border-r border-[#1f2937] p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
            FO
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block">
              FinanceOS
            </span>
            <span className="text-[10px] text-slate-400">
              Personal Treasury
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <button
        onClick={(e) => {
          springPress(e.currentTarget);
          onOpenQuickAdd();
          if (onCloseMobile) onCloseMobile();
        }}
        className="mb-5 flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>New Transaction</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Database Connection Status Widget in Footer */}
      <div className="mt-auto pt-4 border-t border-[#1f2937]">
        <button
          onClick={(e) => {
            springPress(e.currentTarget);
            onOpenDbModal();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-slate-600 text-left transition-colors cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <span
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                isDbConnected ? 'bg-emerald-500' : 'bg-amber-400'
              )}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {isDbConnected ? 'PostgreSQL Live' : 'PostgreSQL Local'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {isDbConnected ? 'localhost:5432' : 'Configure credentials'}
              </p>
            </div>
          </div>
          <Database className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 flex-shrink-0" />
        </button>

        {/* Keyboard shortcut hint (desktop only) */}
        <div className="hidden md:flex mt-2.5 items-center justify-between px-1 text-[11px] text-slate-400">
          <span>Search / Commands</span>
          <kbd className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-800">
            Ctrl+K
          </kbd>
        </div>
      </div>
    </aside>
  );
}
