// src/components/ui/MonthPicker.tsx
import { format, addMonths, subMonths } from 'date-fns';
import { useFinanceStore } from '../../store/useFinanceStore';

export function MonthPicker() {
  const { activeMonth, setActiveMonth } = useFinanceStore();
  const current = new Date(activeMonth + 'T00:00:00');

  const prev = () => setActiveMonth(format(subMonths(current, 1), 'yyyy-MM-dd'));
  const next = () => setActiveMonth(format(addMonths(current, 1), 'yyyy-MM-dd'));

  return (
    <div className="flex items-center gap-2">
      <button onClick={prev} className="btn-ghost px-2 py-1.5">‹</button>
      <span className="text-sm font-medium text-slate-700 w-28 text-center">
        {format(current, 'MMMM yyyy')}
      </span>
      <button onClick={next} className="btn-ghost px-2 py-1.5">›</button>
    </div>
  );
}
