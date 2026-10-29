import { useFinanceStore } from '../../store/useFinanceStore';
import { useCategories }   from '../../hooks/useCategories';

export function FilterBar() {
  const { filters, setFilter, clearFilters } = useFinanceStore();
  const { data: categories = [] } = useCategories();
  const hasFilters = !!(filters.type || filters.category_id || filters.date_from || filters.date_to || filters.search);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input type="text" className="input w-48" placeholder="Search..." value={filters.search ?? ''}
        onChange={e => setFilter('search', e.target.value || undefined)} />
      <select className="select w-36" value={filters.type ?? ''}
        onChange={e => setFilter('type', (e.target.value as any) || undefined)}>
        <option value="">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
        <option value="transfer">Transfer</option>
      </select>
      <select className="select w-44" value={filters.category_id ?? ''}
        onChange={e => setFilter('category_id', e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">All categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input type="date" className="input w-36" value={filters.date_from ?? ''}
        onChange={e => setFilter('date_from', e.target.value || undefined)} />
      <span className="text-slate-400 text-sm">to</span>
      <input type="date" className="input w-36" value={filters.date_to ?? ''}
        onChange={e => setFilter('date_to', e.target.value || undefined)} />
      {hasFilters && <button onClick={clearFilters} className="btn-ghost text-xs">Clear filters</button>}
    </div>
  );
}
