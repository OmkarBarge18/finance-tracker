import Papa from 'papaparse';
import type { TransactionCreate } from '../types';

export type ParsedRow = Record<string, string>;

export interface CSVColumnMapping {
  date: string; amount: string; description: string; type?: string;
}

export function parseCSVFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => v.trim(),
      complete: (results) => resolve(results.data as ParsedRow[]),
      error: (err) => reject(new Error(err.message)),
    });
  });
}

export function mapRowsToTransactions(
  rows: ParsedRow[], mapping: CSVColumnMapping, accountId: number, categoryId?: number
): TransactionCreate[] {
  return rows.map((row) => {
    const rawAmount  = row[mapping.amount] ?? '';
    const numericAmt = parseFloat(rawAmount.replace(/[^0-9.\-]/g, ''));
    if (isNaN(numericAmt)) return null;

    const amount = Math.abs(numericAmt);
    let type: 'income' | 'expense' = numericAmt < 0 ? 'expense' : 'income';
    if (mapping.type) {
      const rawType = (row[mapping.type] ?? '').toLowerCase();
      if (rawType.includes('debit') || rawType.includes('expense')) type = 'expense';
      else if (rawType.includes('credit') || rawType.includes('income')) type = 'income';
    }

    const parsedDate = parseDate(row[mapping.date] ?? '');
    if (!parsedDate) return null;

    return {
      account_id: accountId, category_id: categoryId ?? null,
      amount, type, description: row[mapping.description] ?? '', date: parsedDate,
    } satisfies TransactionCreate;
  }).filter((tx): tx is TransactionCreate => tx !== null);
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`;
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

export function getCSVColumns(rows: ParsedRow[]): string[] {
  return rows.length ? Object.keys(rows[0]) : [];
}
