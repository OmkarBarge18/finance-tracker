import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { TransactionCreate, TransactionUpdate, TransactionFilters } from '../types';

export const txKeys = {
  all:       ()                  => ['transactions']                  as const,
  list:      (f: TransactionFilters) => ['transactions', 'list', f]  as const,
  monthly:   (year: number, accountId?: number) => ['transactions', 'monthly', year, accountId] as const,
  byCategory:(params: object)    => ['transactions', 'by-category', params] as const,
};

export function useTransactions(filters: TransactionFilters) {
  return useQuery({ queryKey: txKeys.list(filters), queryFn: () => api.getTransactions(filters), staleTime: 30_000 });
}

export function useMonthlySummary(year: number, accountId?: number) {
  return useQuery({ queryKey: txKeys.monthly(year, accountId), queryFn: () => api.getMonthlySummary(year, accountId), staleTime: 60_000 });
}

export function useCategorySpend(params: { date_from?: string; date_to?: string; account_id?: number }) {
  return useQuery({ queryKey: txKeys.byCategory(params), queryFn: () => api.getCategorySpend(params), staleTime: 30_000 });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: txKeys.all() });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: TransactionUpdate }) => api.updateTransaction(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: txKeys.all() });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTransaction,
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: txKeys.all() });
      const snapshots = qc.getQueriesData({ queryKey: txKeys.all() });
      qc.setQueriesData({ queryKey: txKeys.all() }, (old: any) =>
        Array.isArray(old) ? old.filter((t: any) => t.id !== id) : old
      );
      return { snapshots };
    },
    onError: (_err: any, _id: any, ctx: any) => {
      ctx?.snapshots.forEach(([key, data]: any) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: txKeys.all() });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useBulkCreateTransactions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.bulkCreateTransactions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: txKeys.all() });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
