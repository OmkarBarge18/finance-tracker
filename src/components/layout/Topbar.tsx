'use client';

import React from 'react';
import { Database, UploadCloud, Plus, Calendar, Menu } from 'lucide-react';
import { springPress } from '@/lib/animations';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenQuickAdd: () => void;
  onOpenCsvImport: () => void;
  onOpenDbModal: () => void;
  isDbConnected: boolean;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenMobileMenu?: () => void;
}

export default function Topbar({
  title,
  subtitle,
  onOpenQuickAdd,
  onOpenCsvImport,
  onOpenDbModal,
  isDbConnected,
  selectedMonth,
  onMonthChange,
  onOpenMobileMenu,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-sm border-b border-[#1f2937] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center space-x-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">{title}</h1>
          {subtitle && <p className="hidden sm:block text-xs text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Month Selector */}
        <div className="flex items-center space-x-1.5 bg-[#111827] px-2.5 py-1.5 rounded-lg border border-[#1f2937] text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="month"
            value={selectedMonth.slice(0, 7)}
            onChange={(e) => onMonthChange(e.target.value ? `${e.target.value}-01` : selectedMonth)}
            className="bg-transparent text-white border-0 outline-none text-xs cursor-pointer font-medium font-tabular"
            aria-label="Filter by month"
          />
        </div>

        {/* Database Status Button */}
        <button
          onClick={(e) => {
            springPress(e.currentTarget);
            onOpenDbModal();
          }}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isDbConnected
              ? 'bg-[#111827] text-slate-200 border-[#1f2937] hover:border-slate-600'
              : 'bg-amber-950/20 text-amber-300 border-amber-900/40 hover:bg-amber-950/40'
          }`}
          title="PostgreSQL status & settings"
        >
          <span
            className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500' : 'bg-amber-400'}`}
          />
          <span className="hidden sm:inline">{isDbConnected ? 'PostgreSQL' : 'Connect DB'}</span>
        </button>

        {/* Import CSV Button */}
        <button
          onClick={(e) => {
            springPress(e.currentTarget);
            onOpenCsvImport();
          }}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-slate-800 border border-[#1f2937] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
          <span>Import CSV</span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            springPress(e.currentTarget);
            onOpenQuickAdd();
          }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">New</span>
        </button>
      </div>
    </header>
  );
}
