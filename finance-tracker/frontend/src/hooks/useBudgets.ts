import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { BudgetCreate } from '../types';

export function useBudgets(month?: string) {
  return useQuery({ queryKey: ['budgets', month], queryFn: () => api.getBudgets(month), staleTime: 60_000 });
}

export function useBudgetProgress(month: string) {
  return useQuery({
    queryKey: ['budgets', 'progress', month],
    queryFn:  () => api.getBudgetProgress(month),
    staleTime: 30_000,
    enabled:   !!month,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createBudget, onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }) });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteBudget, onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }) });
}
