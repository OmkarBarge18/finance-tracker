import { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import { useFinanceStore }  from '../../store/useFinanceStore';
import { formatCurrency, formatDate, txTypeColor, txAmountSign } from '../../utils/format';
import { TransactionForm }  from './TransactionForm';
import type { Transaction } from '../../types';

export function TransactionTable() {
  const { filters, selectedAccountId } = useFinanceStore();
  const { data: transactions = [], isLoading } = useTransactions({ ...filters, account_id: selectedAccountId ?? undefined });
  const deleteMutation = useDeleteTransaction();
  const [editing, setEditing] = useState<Transaction | null>(null);

  if (isLoading) return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
    </div>
  );

  if (!transactions.length) return (
    <div className="card p-12 text-center text-slate-400">
      <p className="text-base mb-1">No transactions found</p>
      <p className="text-sm">Add one above or import a CSV</p>
    </div>
  );

  return (
    <>
      {editing && <TransactionForm initial={editing} onClose={() => setEditing(null)} />}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Date','Description','Category','Account','Amount',''].map(h => (
                <th key={h} className={`px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'} ${h === 'Category' ? 'hidden md:table-cell' : ''} ${h === 'Account' ? 'hidden lg:table-cell' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(tx.date)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 truncate max-w-[200px]">{tx.description ?? '—'}</div>
                  {tx.notes && <div className="text-xs text-slate-400 truncate">{tx.notes}</div>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {tx.category
                    ? <span className="inline-flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full" style={{ background: tx.category.colour }} />{tx.category.name}</span>
                    : <span className="text-slate-300 text-xs">Uncategorised</span>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-slate-500">{tx.account.name}</span></td>
                <td className={`px-4 py-3 text-right font-medium tabular-nums ${txTypeColor(tx.type)}`}>{txAmountSign(tx.type, tx.amount)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditing(tx)} className="btn-ghost p-1.5 text-xs" title="Edit">✎</button>
                    <button onClick={() => { if (confirm('Delete this transaction?')) deleteMutation.mutate(tx.id); }} className="btn-danger p-1.5 text-xs" title="Delete">✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
