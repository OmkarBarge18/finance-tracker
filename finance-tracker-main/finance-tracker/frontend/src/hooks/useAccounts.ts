import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { AccountCreate } from '../types';

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: api.getAccounts, staleTime: 60_000 });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createAccount, onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }) });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
