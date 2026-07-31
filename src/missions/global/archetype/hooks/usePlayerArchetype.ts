import { useQuery } from '@tanstack/react-query';
import { fetchPlayerArchetype } from './archetypeApi';

export function usePlayerArchetype(address?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['playerArchetype', address],
    queryFn: () => fetchPlayerArchetype(address!),
    enabled: Boolean(address),
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    archetype: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
