import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchArchetypeBadgesCatalogue, putArchetypeBadge, CosmeticsError } from './cosmeticsApi';

interface UseArchetypeBadgesProps {
  address?: string;
  getAccessToken?: () => Promise<string | null>;
}

export function useArchetypeBadges({ address, getAccessToken }: UseArchetypeBadgesProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['archetypeBadges', address],
    queryFn: () => fetchArchetypeBadgesCatalogue(address!),
    enabled: Boolean(address),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const equip = useMutation({
    mutationFn: (itemId: string) => {
      if (!getAccessToken) {
        throw new CosmeticsError(401, 'No auth available for this host');
      }
      return putArchetypeBadge(address!, itemId, getAccessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archetypeBadges', address] });
      queryClient.invalidateQueries({ queryKey: ['playerArchetype', address] });
    },
  });

  return {
    items: data?.items ?? [],
    equippedItemId: data?.equippedItemId ?? null,
    isLoading,
    error: error as Error | null,
    equip: equip.mutate,
    isEquipping: equip.isPending,
    equipError: equip.error as Error | null,
  };
}
