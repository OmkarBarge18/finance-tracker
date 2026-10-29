import { useState }  from 'react';
import { useForm }   from 'react-hook-form';
import { useBudgetProgress, useCreateBudget, useDeleteBudget } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useToast }      from '../ui/Toast';
import { BudgetProgressBar } from './BudgetProgressBar';

interface FormValues { category_id: string; amount: string; }

export function BudgetList() {
  const { activeMonth } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();

  const { data: progress = [], isLoading } = useBudgetProgress(activeMonth);
  const { data: categories = [] }          = useCategories('expense');
  const createMutation = useCreateBudget();
  const deleteMutation = useDeleteBudget();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ defaultValues: { category_id: '', amount: '' } });

  const onSubmit = async (values: FormValues) => {
    if (!values.category_id) return;
    try {
      await createMutation.mutateAsync({
        category_id: Number(values.category_id),
        amount:      parseFloat(values.amount),
        month:       activeMonth,
      });
      toast.success('Budget saved');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save budget');
    }
  };

  const handleDelete = async (budgetId: number) => {
    if (!confirm('Remove this budget?')) return;
    try {
      await deleteMutation.mutateAsync(budgetId);
      toast.success('Budget removed');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete');
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Monthly budgets</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className={showForm ? 'btn-secondary py-1.5 text-xs' : 'btn-primary py-1.5 text-xs'}
        >
          {showForm ? 'Cancel' : '+ Add budget'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-5 py-4 border-b border-slate-100 bg-indigo-50/50 animate-fade-down">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category *</label>
                <select className={`select text-sm ${errors.category_id ? 'border-red-400' : ''}`}
                  {...register('category_id', { required: true, validate: v => v !== '' })}>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-xs text-red-500 mt-1">Required</p>}
                {categories.length === 0 && <p className="text-xs text-amber-600 mt-1">No expense categories — add some on the Categories page</p>}
              </div>
              <div>
                <label className="label">Monthly limit *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input type="number" step="0.01" min="1" placeholder="0.00"
                    className={`input pl-7 text-sm ${errors.amount ? 'border-red-400' : ''}`}
                    {...register('amount', { required: true, validate: v => parseFloat(v) > 0 })} />
                </div>
                {errors.amount && <p className="text-xs text-red-500 mt-1">Enter a valid amount</p>}
              </div>
            </div>
            <button type="submit" className="btn-primary w-full text-sm py-2" disabled={isSubmitting}>
              {isSubmitting
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                : 'Save budget'
              }
            </button>
          </form>
        </div>
      )}

      {/* Progress list */}
      {isLoading ? (
        <div className="p-5 space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}
        </div>
      ) : progress.length === 0 ? (
        <div className="py-14 text-center text-slate-400">
          <p className="text-3xl mb-3">◎</p>
          <p className="text-sm font-medium mb-1">No budgets for this month</p>
          <p className="text-xs">Click &quot;+ Add budget&quot; to set spending limits</p>
        </div>
      ) : (
        <div>
          {progress.map((b, i) => (
            <div key={b.budget_id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <BudgetProgressBar budget={b} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
