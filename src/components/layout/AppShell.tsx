'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DbStatusModal from '@/components/ui/DbStatusModal';
import TransactionModal from '@/components/transactions/TransactionModal';
import CsvImportModal from '@/components/transactions/CsvImportModal';
import CommandPalette from '@/components/layout/CommandPalette';
import { Account, Category, Transaction } from '@/lib/types';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const refreshBaseData = async () => {
    try {
      const [accRes, catRes, dbRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/categories'),
        fetch('/api/db-status'),
      ]);
      if (accRes.ok) setAccounts(await accRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setIsDbConnected(dbData.connected);
      }
    } catch (e) {
      console.warn('Initial data load warning:', e);
    }
  };

  useEffect(() => {
    refreshBaseData();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to open events from child pages
  useEffect(() => {
    const handleOpenAdd = () => setIsQuickAddOpen(true);
    const handleOpenCsv = () => setIsCsvImportOpen(true);
    const handleOpenDb = () => setIsDbModalOpen(true);
    const handleToggleMobile = () => setIsMobileMenuOpen((prev) => !prev);

    window.addEventListener('finance:open-add', handleOpenAdd);
    window.addEventListener('finance:open-csv', handleOpenCsv);
    window.addEventListener('finance:open-db', handleOpenDb);
    window.addEventListener('finance:toggle-mobile-menu', handleToggleMobile);

    return () => {
      window.removeEventListener('finance:open-add', handleOpenAdd);
      window.removeEventListener('finance:open-csv', handleOpenCsv);
      window.removeEventListener('finance:open-db', handleOpenDb);
      window.removeEventListener('finance:toggle-mobile-menu', handleToggleMobile);
    };
  }, []);

  const handleTransactionCreated = (newTx: Transaction) => {
    window.dispatchEvent(new CustomEvent('finance:transaction-created', { detail: newTx }));
    refreshBaseData();
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f17] text-slate-100">
      {/* Desktop Sidebar (visible on md and up) */}
      <div className="hidden md:flex h-screen sticky top-0 flex-shrink-0 z-40">
        <Sidebar
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          isDbConnected={isDbConnected}
        />
      </div>

      {/* Mobile Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenDbModal={() => setIsDbModalOpen(true)}
              isDbConnected={isDbConnected}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-16">{children}</main>

      {/* Global Modals */}
      <DbStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onStatusChange={(conn) => {
          setIsDbConnected(conn);
          refreshBaseData();
        }}
      />

      <TransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={handleTransactionCreated}
        accounts={accounts}
        categories={categories}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('finance:data-refreshed'));
          refreshBaseData();
        }}
        accounts={accounts}
        categories={categories}
      />

      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenCsvImport={() => setIsCsvImportOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />
    </div>
  );
}
