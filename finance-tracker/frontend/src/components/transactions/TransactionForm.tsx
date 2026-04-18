import { useForm }  from 'react-hook-form';
import { useCreateTransaction, useUpdateTransaction } from '../../hooks/useTransactions';
import { useAccounts }   from '../../hooks/useAccounts';
import { useCategories } from '../../hooks/useCategories';
import { useToast }      from '../ui/Toast';
import { format }        from 'date-fns';
import type { Transaction, TransactionCreate } from '../../types';

interface Props { initial?: Transaction; onClose: () => void; }

type FormValues = {
  account_id:  string;
  category_id: string;
  amount:      string;
  type:        'income' | 'expense' | 'transfer';
  description: string;
  date:        string;
  notes:       string;
};

export function TransactionForm({ initial, onClose }: Props) {
  const { data: accounts   = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const toast   = useToast();
  const isEditing = !!initial;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      defaultValues: {
        account_id:  String(initial?.account_id  ?? accounts[0]?.id ?? ''),
        category_id: String(initial?.category_id ?? ''),
        amount:      String(initial?.amount      ?? ''),
        type:        initial?.type               ?? 'expense',
        description: initial?.description        ?? '',
        date:        initial?.date               ?? format(new Date(), 'yyyy-MM-dd'),
        notes:       initial?.notes              ?? '',
      },
    });

  const txType = watch('type');
  const filteredCats = categories.filter(c => txType === 'transfer' || c.type === txType);

  const onSubmit = async (values: FormValues) => {
    const body: TransactionCreate = {
      account_id:  Number(values.account_id),
      category_id: values.category_id ? Number(values.category_id) : null,
      amount:      parseFloat(values.amount),
      type:        values.type,
      description: values.description || undefined,
      date:        values.date,
      notes:       values.notes || undefined,
    };
    try {
      if (isEditing && initial) {
        await updateMutation.mutateAsync({ id: initial.id, body });
        toast.success('Transaction updated');
      } else {
        await createMutation.mutateAsync(body);
        toast.success('Transaction added');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save transaction');
    }
  };

  const typeColors = {
    expense:  { active: 'bg-red-500 text-white border-red-500',   idle: 'border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600' },
    income:   { active: 'bg-emerald-500 text-white border-emerald-500', idle: 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600' },
    transfer: { active: 'bg-blue-500 text-white border-blue-500',  idle: 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600' },
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit transaction' : 'Add transaction'}</h2>
          <button onClick={onClose} className="btn-icon text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-body">
          {/* Type toggle */}
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {(['expense', 'income', 'transfer'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={`type-pill border-2 capitalize ${txType === t ? typeColors[t].active : typeColors[t].idle}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number" step="0.01" min="0.01"
                className={`input pl-8 ${errors.amount ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                placeholder="0.00"
                {...register('amount', {
                  required: 'Amount is required',
                  validate: v => parseFloat(v) > 0 || 'Must be greater than 0',
                })}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          {/* Account */}
          <div>
            <label className="label">Account *</label>
            <select className={`select ${errors.account_id ? 'border-red-400' : ''}`}
              {...register('account_id', { required: 'Select an account', validate: v => v !== '' || 'Select an account' })}>
              <option value="">— Select account —</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {errors.account_id && <p className="text-xs text-red-500 mt-1">{errors.account_id.message}</p>}
            {accounts.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No accounts yet — create one on the Accounts page first</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select className="select" {...register('category_id')}>
              <option value="">— None —</option>
              {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <input type="text" className="input" placeholder="e.g. Grocery run" {...register('description')} />
          </div>

          {/* Date */}
          <div>
            <label className="label">Date *</label>
            <input type="date" className={`input ${errors.date ? 'border-red-400' : ''}`}
              {...register('date', { required: 'Date is required' })} />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
            <textarea rows={2} className="input resize-none" placeholder="Any additional notes..."
              {...register('notes')} />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting || accounts.length === 0}>
              {isSubmitting
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                : isEditing ? 'Save changes' : 'Add transaction'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
