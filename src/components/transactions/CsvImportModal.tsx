'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Account, Category } from '@/lib/types';
import { springPress, triggerConfetti } from '@/lib/animations';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
  categories: Category[];
}

export default function CsvImportModal({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  categories,
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState<number>(accounts[0]?.id || 1);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [dateCol, setDateCol] = useState('');
  const [amountCol, setAmountCol] = useState('');
  const [descCol, setDescCol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setError('CSV file must have a header row and at least one data row.');
          return;
        }

        // Parse header
        const rawHeaders = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
        setHeaders(rawHeaders);

        // Auto-detect columns
        const dateGuess = rawHeaders.find((h) => /date|time/i.test(h)) || rawHeaders[0];
        const amountGuess = rawHeaders.find((h) => /amount|sum|price|total/i.test(h)) || rawHeaders[1];
        const descGuess = rawHeaders.find((h) => /desc|memo|payee|name|detail/i.test(h)) || rawHeaders[2] || rawHeaders[0];

        setDateCol(dateGuess);
        setAmountCol(amountGuess);
        setDescCol(descGuess);

        // Parse preview rows (first 5)
        const rows = lines.slice(1, 6).map((line) => {
          const cells = line.split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
          const obj: any = {};
          rawHeaders.forEach((h, idx) => {
            obj[h] = cells[idx] || '';
          });
          return obj;
        });
        setParsedRows(rows);
      } catch (err) {
        setError('Error parsing CSV file: ' + (err as Error).message);
      }
    };
    reader.readAsText(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        const rawHeaders = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());

        const dateIdx = rawHeaders.indexOf(dateCol);
        const amountIdx = rawHeaders.indexOf(amountCol);
        const descIdx = rawHeaders.indexOf(descCol);

        const transactions = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
          if (cells.length < 2) continue;

          let rawAmount = parseFloat(cells[amountIdx]?.replace(/[^-0-9.]/g, '') || '0');
          if (isNaN(rawAmount) || rawAmount === 0) continue;

          const type = rawAmount < 0 ? 'expense' : 'expense'; // default expense
          const absAmount = Math.abs(rawAmount);

          // normalize date
          let rawDate = cells[dateIdx] || new Date().toISOString().split('T')[0];
          let formattedDate = rawDate;
          if (rawDate.includes('/')) {
            const p = rawDate.split('/');
            if (p.length === 3) {
              formattedDate = `${p[2].length === 2 ? '20' + p[2] : p[2]}-${p[0].padStart(2, '0')}-${p[1].padStart(2, '0')}`;
            }
          }

          transactions.push({
            account_id: accountId,
            category_id: null,
            amount: absAmount,
            type: rawAmount > 0 ? 'income' : 'expense',
            description: cells[descIdx] || 'Imported Transaction',
            date: formattedDate,
            notes: `Imported from ${file.name}`,
          });
        }

        if (transactions.length === 0) {
          throw new Error('No valid transactions could be parsed from the file.');
        }

        const res = await fetch('/api/transactions/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions }),
        });

        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to import transactions');
        }

        triggerConfetti();
        onSuccess();
        onClose();
      };
      reader.readAsText(file);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/70 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Import Bank Statement (CSV)</h3>
              <p className="text-xs text-slate-400">Automatic column detection & bulk sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Account Target */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(parseInt(e.target.value))}
              className="w-full glass-input px-3 py-2 rounded-xl text-sm text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                  {acc.name} (${acc.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center">
              <FileText className="w-8 h-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-slate-200">
                {file ? file.name : 'Drop your CSV bank statement here, or browse'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports Chase, Amex, Wells Fargo, Revolut, etc.</p>
            </div>
          </div>

          {/* Column Mapping if file selected */}
          {headers.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Map Columns
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Date Column</label>
                  <select
                    value={dateCol}
                    onChange={(e) => setDateCol(e.target.value)}
                    className="w-full glass-input px-2 py-1.5 rounded-lg text-xs text-white"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h} className="bg-slate-900 text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Amount Column</label>
                  <select
                    value={amountCol}
                    onChange={(e) => setAmountCol(e.target.value)}
                    className="w-full glass-input px-2 py-1.5 rounded-lg text-xs text-white"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h} className="bg-slate-900 text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                  <select
                    value={descCol}
                    onChange={(e) => setDescCol(e.target.value)}
                    className="w-full glass-input px-2 py-1.5 rounded-lg text-xs text-white"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h} className="bg-slate-900 text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview Rows */}
              {parsedRows.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] text-slate-400 mb-1.5">Preview of first {parsedRows.length} rows:</p>
                  <div className="max-h-28 overflow-y-auto rounded-lg border border-slate-800 text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800/80 text-slate-300">
                        <tr>
                          <th className="p-1.5">Date</th>
                          <th className="p-1.5">Description</th>
                          <th className="p-1.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-800/30">
                            <td className="p-1.5 text-slate-400">{r[dateCol]}</td>
                            <td className="p-1.5 text-slate-200">{r[descCol]}</td>
                            <td className="p-1.5 text-right font-mono text-emerald-400">
                              {r[amountCol]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!file || loading}
              onClick={(e) => {
                springPress(e.currentTarget);
                handleImport();
              }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm Bulk Import</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
