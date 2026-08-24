import { useQuery } from '@tanstack/react-query';
import { fetchPreferencesCompletion } from './preferencesApi';

export function usePreferencesCompletion(address?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['preferencesCompletion', address],
    queryFn: () => fetchPreferencesCompletion(address!),
    enabled: Boolean(address),
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    completion: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
