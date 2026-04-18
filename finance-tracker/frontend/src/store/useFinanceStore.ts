import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, startOfMonth } from 'date-fns';
import type { TransactionFilters } from '../types';

interface FinanceStore {
  selectedAccountId:    number | null;
  setSelectedAccountId: (id: number | null) => void;
  activeMonth:          string;
  setActiveMonth:       (month: string) => void;
  filters:              TransactionFilters;
  setFilter:            <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => void;
  clearFilters:         () => void;
  analyticsYear:        number;
  setAnalyticsYear:     (year: number) => void;
  sidebarCollapsed:     boolean;
  toggleSidebar:        () => void;
}

const DEFAULT_FILTERS: TransactionFilters = { limit: 50, offset: 0 };

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      selectedAccountId:    null,
      setSelectedAccountId: (id) => set({ selectedAccountId: id }),

      activeMonth:    format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      setActiveMonth: (month) => set({ activeMonth: month }),

      filters:      DEFAULT_FILTERS,
      setFilter:    (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value, offset: 0 } })),
      clearFilters: () => set({ filters: DEFAULT_FILTERS }),

      analyticsYear:    new Date().getFullYear(),
      setAnalyticsYear: (year) => set({ analyticsYear: year }),

      sidebarCollapsed: false,
      toggleSidebar:    () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'finance-ui-v1',
      partialize: (s) => ({
        selectedAccountId: s.selectedAccountId,
        activeMonth:       s.activeMonth,
        analyticsYear:     s.analyticsYear,
        sidebarCollapsed:  s.sidebarCollapsed,
      }),
    }
  )
);
