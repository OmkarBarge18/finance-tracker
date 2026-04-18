export function formatCurrency(amount: number, currency = 'USD', opts?: { compact?: boolean; showSign?: boolean }): string {
  const sign = opts?.showSign && amount > 0 ? '+' : '';
  if (opts?.compact && Math.abs(amount) >= 1000) {
    return sign + new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(amount);
  }
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(Math.abs(amount));
  return sign + (amount < 0 ? '-' : '') + formatted;
}

export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export function formatMonth(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function monthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });
}

export function monthShort(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'short' });
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function accountTypeLabel(type: string): string {
  const map: Record<string, string> = {
    checking: 'Checking', savings: 'Savings', credit: 'Credit Card',
    investment: 'Investment', cash: 'Cash',
  };
  return map[type] ?? type;
}

export function txTypeColor(type: string): string {
  if (type === 'income')  return 'text-emerald-600';
  if (type === 'expense') return 'text-red-500';
  return 'text-blue-500';
}

export function txAmountSign(type: string, amount: number): string {
  if (type === 'income')  return `+${formatCurrency(amount)}`;
  if (type === 'expense') return `-${formatCurrency(amount)}`;
  return formatCurrency(amount);
}

export function budgetStatusColor(pct: number): string {
  if (pct >= 100) return 'bg-red-500';
  if (pct >= 80)  return 'bg-amber-400';
  return 'bg-emerald-500';
}
