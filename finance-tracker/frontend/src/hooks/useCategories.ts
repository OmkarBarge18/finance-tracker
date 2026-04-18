import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useCategories(type?: 'income' | 'expense') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn:  () => api.getCategories(type),
    staleTime: 300_000,
  });
}
