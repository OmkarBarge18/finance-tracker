// src/components/transactions/CSVImport.tsx
// Step 1: upload CSV → Step 2: map columns → Step 3: confirm + import
import { useState, useRef } from 'react';
import { parseCSVFile, getCSVColumns, mapRowsToTransactions, type ParsedRow, type CSVColumnMapping } from '../../utils/csv';
import { useBulkCreateTransactions } from '../../hooks/useTransactions';
import { useAccounts }  from '../../hooks/useAccounts';
import type { TransactionCreate } from '../../types';

type Step = 'upload' | 'map' | 'confirm';

interface Props { onClose: () => void; }

export function CSVImport({ onClose }: Props) {
  const [step, setStep]       = useState<Step>('upload');
  const [rows, setRows]       = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Partial<CSVColumnMapping>>({});
  const [accountId, setAccountId] = useState<number | ''>('');
  const [preview, setPreview] = useState<TransactionCreate[]>([]);
  const [error, setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: accounts = [] } = useAccounts();
  const bulkMutation = useBulkCreateTransactions();

  // ── Step 1: parse file ────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setError(null);
    try {
      const parsed = await parseCSVFile(file);
      if (!parsed.length) { setError('CSV is empty or could not be parsed.'); return; }
      setRows(parsed);
      setColumns(getCSVColumns(parsed));
      // Auto-detect common column names
      const cols = getCSVColumns(parsed).map(c => c.toLowerCase());
      const find = (candidates: string[]) =>
        getCSVColumns(parsed).find(c => candidates.includes(c.toLowerCase()));
      setMapping({
        date:        find(['date', 'transaction date', 'posted date', 'txn date']),
        amount:      find(['amount', 'value', 'debit', 'credit', 'sum']),
        description: find(['description', 'memo', 'details', 'narration', 'payee']),
      });
      setStep('map');
    } catch (e: any) {
      setError(e.message ?? 'Failed to parse CSV');
    }
  };

  // ── Step 2: validate mapping + build preview ───────────────────────
  const handleMap = () => {
    if (!mapping.date || !mapping.amount || !mapping.description) {
      setError('Please map all required fields.'); return;
    }
    if (!accountId) {
      setError('Please select an account.'); return;
    }
    setError(null);
    const mapped = mapRowsToTransactions(
      rows, mapping as CSVColumnMapping, Number(accountId)
    );
    if (!mapped.length) { setError('No valid rows could be parsed.'); return; }
    setPreview(mapped);
    setStep('confirm');
  };

  // ── Step 3: import ────────────────────────────────────────────────
  const handleImport = async () => {
    await bulkMutation.mutateAsync(preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Import CSV</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">✕</button>
        </div>

        <div className="p-5">
          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {(['upload', 'map', 'confirm'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${step === s ? 'bg-indigo-600 text-white' : i < ['upload','map','confirm'].indexOf(step) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i + 1}
                </div>
                <span className={`text-sm capitalize ${step === s ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{s}</span>
                {i < 2 && <span className="text-slate-200">›</span>}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ── Step 1: upload ─────────────────────────────────────── */}
          {step === 'upload' && (
            <div>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                <p className="text-2xl mb-2">📄</p>
                <p className="font-medium text-slate-700">Click to upload a CSV file</p>
                <p className="text-sm text-slate-400 mt-1">Exported from your bank or credit card</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* ── Step 2: map columns ────────────────────────────────── */}
          {step === 'map' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                {rows.length} rows found. Map your CSV columns to the required fields.
              </p>

              <div>
                <label className="label">Account <span className="text-red-400">*</span></label>
                <select className="select" value={accountId} onChange={e => setAccountId(Number(e.target.value))}>
                  <option value="">Select account...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              {(['date', 'amount', 'description'] as const).map(field => (
                <div key={field}>
                  <label className="label capitalize">{field} column <span className="text-red-400">*</span></label>
                  <select
                    className="select"
                    value={mapping[field] ?? ''}
                    onChange={e => setMapping(m => ({ ...m, [field]: e.target.value || undefined }))}
                  >
                    <option value="">Select column...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}

              <div>
                <label className="label">Type column <span className="text-slate-400 font-normal">(optional — inferred from amount sign if absent)</span></label>
                <select
                  className="select"
                  value={mapping.type ?? ''}
                  onChange={e => setMapping(m => ({ ...m, type: e.target.value || undefined }))}
                >
                  <option value="">— Auto-detect —</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('upload')} className="btn-secondary flex-1">Back</button>
                <button onClick={handleMap} className="btn-primary flex-1">Preview</button>
              </div>
            </div>
          )}

          {/* ── Step 3: confirm ────────────────────────────────────── */}
          {step === 'confirm' && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Ready to import <span className="font-semibold text-slate-800">{preview.length}</span> transactions.
              </p>
              <div className="border border-slate-100 rounded-lg overflow-hidden mb-4 max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500">Date</th>
                      <th className="text-left px-3 py-2 text-slate-500">Description</th>
                      <th className="text-left px-3 py-2 text-slate-500">Type</th>
                      <th className="text-right px-3 py-2 text-slate-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {preview.slice(0, 50).map((tx, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-500">{tx.date}</td>
                        <td className="px-3 py-2 text-slate-700 truncate max-w-[160px]">{tx.description}</td>
                        <td className="px-3 py-2">
                          <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums">
                          ${tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 50 && (
                  <p className="text-center text-xs text-slate-400 py-2">
                    ...and {preview.length - 50} more
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('map')} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={handleImport}
                  className="btn-primary flex-1"
                  disabled={bulkMutation.isPending}
                >
                  {bulkMutation.isPending ? 'Importing...' : `Import ${preview.length} transactions`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
