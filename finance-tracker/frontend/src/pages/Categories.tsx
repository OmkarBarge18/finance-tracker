import { useState }  from 'react';
import { useForm }   from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api }       from '../api/client';
import { useToast }  from '../components/ui/Toast';

const PRESET_COLOURS = [
  '#6366f1','#10b981','#f97316','#ef4444','#3b82f6',
  '#8b5cf6','#ec4899','#f59e0b','#14b8a6','#84cc16',
  '#06b6d4','#a855f7','#e11d48','#0ea5e9','#22c55e',
];

const PRESET_ICONS = ['🛒','🍔','🚗','🏠','💡','🏥','🎬','✈','📚','💪','📱','🎵','☕','🐶','🎮'];

interface FormValues { name: string; type: 'income' | 'expense'; colour: string; icon: string; }

export function Categories() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState<'all' | 'income' | 'expense'>('all');
  const toast   = useToast();
  const qc      = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => api.getCategories(),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); },
  });
  const deleteMutation = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); },
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ defaultValues: { name: '', type: 'expense', colour: '#6366f1', icon: '🛒' } });

  const selectedColour = watch('colour');
  const selectedIcon   = watch('icon');
  const formType       = watch('type');

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success(`"${values.name}" category added`);
      reset({ name: '', type: values.type, colour: values.colour, icon: values.icon });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create category');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? Transactions using it will be uncategorised.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Category deleted');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete');
    }
  };

  const visible = categories.filter(c => filter === 'all' || c.type === filter);
  const incomeCount  = categories.filter(c => c.type === 'income').length;
  const expenseCount = categories.filter(c => c.type === 'expense').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Categories</h2>
          <p className="text-sm text-slate-500">{incomeCount} income · {expenseCount} expense</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? 'Cancel' : '+ Add category'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-6 animate-scale-in">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">New category</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Type toggle */}
            <div>
              <label className="label">Type</label>
              <div className="flex gap-2">
                {(['expense', 'income'] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => setValue('type', t)}
                    className={`type-pill border-2 capitalize ${formType === t
                      ? t === 'expense' ? 'bg-red-500 text-white border-red-500' : 'bg-emerald-500 text-white border-emerald-500'
                      : 'border-slate-200 text-slate-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">Name *</label>
              <input className={`input ${errors.name ? 'border-red-400' : ''}`}
                placeholder="e.g. Food & Dining"
                {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Icon picker */}
            <div>
              <label className="label">Icon</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map(icon => (
                  <button key={icon} type="button"
                    onClick={() => setValue('icon', icon)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all duration-150
                      ${selectedIcon === icon ? 'border-indigo-400 bg-indigo-50 scale-110' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Colour picker */}
            <div>
              <label className="label">Colour</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PRESET_COLOURS.map(colour => (
                  <button key={colour} type="button"
                    onClick={() => setValue('colour', colour)}
                    className={`color-dot ${selectedColour === colour ? 'selected' : ''}`}
                    style={{ background: colour, color: colour }} />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                   style={{ background: selectedColour + '25' }}>
                {selectedIcon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{watch('name') || 'Category name'}</p>
                <p className="text-xs text-slate-400 capitalize">{watch('type')}</p>
              </div>
              <div className="ml-auto w-3 h-3 rounded-full" style={{ background: selectedColour }} />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating...</>
                : 'Create category'
              }
            </button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'expense', 'income'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 capitalize
              ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
            {f === 'all' ? `All (${categories.length})` : f === 'expense' ? `Expense (${expenseCount})` : `Income (${incomeCount})`}
          </button>
        ))}
      </div>

      {/* Category grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-14 text-center text-slate-400 animate-fade-up">
          <p className="text-4xl mb-3">◑</p>
          <p className="font-medium text-slate-600 mb-1">No categories yet</p>
          <p className="text-sm">Add categories to organise your transactions</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((cat, i) => (
            <div
              key={cat.id}
              className="card group flex items-center gap-3 p-3.5 animate-fade-up hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: cat.colour + '22' }}>
                {cat.icon ?? '◑'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{cat.name}</p>
                <p className={`text-xs font-medium capitalize ${cat.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {cat.type}
                </p>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.colour }} />
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="btn-icon w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <span className="text-xs">✕</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
