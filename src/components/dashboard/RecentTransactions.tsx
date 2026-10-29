'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Trash2, ChevronRight, Tag } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { staggerEntrance, springPress } from '@/lib/animations';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export default function RecentTransactions({ transactions, onDelete }: RecentTransactionsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('.tx-item');
      if (items.length > 0) {
        staggerEntrance(items, 0.03);
      }
    }
  }, [transactions]);

  return (
    <div className="surface-card rounded-xl p-5 border border-[#1f2937]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Recent Activity</h3>
          <p className="text-xs text-slate-400">Latest financial ledger events</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center space-x-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500">
          No transactions recorded yet. Use &ldquo;New Transaction&rdquo; above to log an entry.
        </div>
      ) : (
        <div ref={listRef} className="space-y-2">
          {transactions.slice(0, 6).map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                className="tx-item flex items-center justify-between p-2.5 rounded-lg bg-[#0b0f17] hover:bg-slate-800/40 border border-[#1f2937] transition-colors group"
              >
                {/* Left: Direction indicator & Details */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                      isIncome
                        ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
                        : isTransfer
                        ? 'bg-indigo-950/30 border-indigo-900/40 text-indigo-400'
                        : 'bg-rose-950/30 border-rose-900/40 text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : isTransfer ? (
                      <ArrowLeftRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">{tx.account_name || 'Account'}</span>
                      {tx.category_name && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">
                            {tx.category_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete Action */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span
                    className={`font-tabular text-xs font-bold ${
                      isIncome
                        ? 'text-emerald-400'
                        : isTransfer
                        ? 'text-indigo-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : isTransfer ? '' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>

                  <button
                    onClick={(e) => {
                      springPress(e.currentTarget);
                      if (confirm('Delete this transaction?')) {
                        onDelete(tx.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                    title="Delete transaction"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
