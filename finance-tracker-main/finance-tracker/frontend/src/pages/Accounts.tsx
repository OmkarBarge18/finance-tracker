import { useState }  from 'react';
import { useForm }   from 'react-hook-form';
import { useAccounts, useCreateAccount, useDeleteAccount } from '../hooks/useAccounts';
import { useToast }  from '../components/ui/Toast';
import { formatCurrency, accountTypeLabel } from '../utils/format';
import type { AccountCreate, AccountType } from '../types';

const ACCOUNT_TYPES: AccountType[] = ['checking', 'savings', 'credit', 'investment', 'cash'];
const ACCOUNT_COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16',
];

const TYPE_ICONS: Record<string, string> = {
  checking: '🏦', savings: '💰', credit: '💳', investment: '📈', cash: '💵',
};

export function Accounts() {
  const [showForm, setShowForm] = useState(false);
  const { data: accounts = [], isLoading } = useAccounts();
  const createMutation = useCreateAccount();
  const deleteMutation = useDeleteAccount();
  const toast = useToast();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<AccountCreate>({
      defaultValues: { type: 'checking', currency: 'USD', color: '#6366f1', balance: 0, name: '' },
    });

  const onSubmit = async (values: AccountCreate) => {
    try {
      await createMutation.mutateAsync({ ...values, balance: Number(values.balance) });
      toast.success(`${values.name} account created`);
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create account');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}" and all its transactions? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Account deleted');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete');
    }
  };

  const totalNetWorth = accounts.filter(a => a.type !== 'credit').reduce((s, a) => s + a.balance, 0);
  const selectedColor = watch('color');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="animate-fade-up">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Accounts</h2>
          <p className="text-3xl font-bold text-slate-900 tabular-nums num-anim">
            {formatCurrency(totalNetWorth)}
          </p>
          <p className="text-sm text-slate-400 mt-0.5">Net worth (excl. credit)</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className={showForm ? 'btn-secondary' : 'btn-primary'}
        >
          {showForm ? 'Cancel' : '+ Add account'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-6 animate-scale-in">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">New account</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Account name *</label>
                <input className={`input ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="e.g. Chase Checking"
                  {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Type</label>
                <select className="select" {...register('type')}>
                  {ACCOUNT_TYPES.map(t => (
                    <option key={t} value={t}>{TYPE_ICONS[t]} {accountTypeLabel(t)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Starting balance ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input type="number" step="0.01" placeholder="0.00"
                    className="input pl-8" {...register('balance')} />
                </div>
              </div>

              <div>
                <label className="label">Currency</label>
                <select className="select" {...register('currency')}>
                  {['USD','EUR','GBP','INR','CAD','AUD','JPY'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Colour</label>
                <div className="flex gap-2 flex-wrap mt-1.5">
                  {ACCOUNT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      className={`color-dot ${selectedColor === color ? 'selected' : ''}`}
                      style={{ background: color, color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating...</>
                : 'Create account'
              }
            </button>
          </form>
        </div>
      )}

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32" />)}
        </div>
      ) : accounts.length === 0 ? (
        <div className="card p-16 text-center text-slate-400 animate-fade-up">
          <p className="text-4xl mb-4">🏦</p>
          <p className="font-medium text-slate-600 mb-1">No accounts yet</p>
          <p className="text-sm">Add your first account to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc, i) => (
            <div
              key={acc.id}
              className="card-hover p-5 group animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                       style={{ background: acc.color + '20' }}>
                    {TYPE_ICONS[acc.type]}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{accountTypeLabel(acc.type)}</p>
                    <p className="font-semibold text-slate-800 text-sm leading-tight">{acc.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(acc.id, acc.name)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity btn-icon text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <span className="text-sm">✕</span>
                </button>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-bold tabular-nums ${acc.balance < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                    {formatCurrency(acc.balance, acc.currency)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{acc.currency}</p>
                </div>
                {/* Color stripe */}
                <div className="w-1.5 h-10 rounded-full" style={{ background: acc.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
