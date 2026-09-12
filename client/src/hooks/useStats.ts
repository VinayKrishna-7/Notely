import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/statsApi';
import { DashboardStats } from '../types';

export function useStats() {
  const query = useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: () => statsApi.getStats(),
    staleTime: 1000 * 60 * 2,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
