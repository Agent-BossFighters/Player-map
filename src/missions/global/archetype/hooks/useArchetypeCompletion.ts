import { useQuery } from '@tanstack/react-query';
import { fetchArchetypeCompletion } from './archetypeApi';

export function useArchetypeCompletion(address?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['archetypeCompletion', address],
    queryFn: () => fetchArchetypeCompletion(address!),
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
