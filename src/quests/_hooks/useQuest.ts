import { useQuery } from '@tanstack/react-query';
import { Quest, QuestStatus, QuestStatusResult } from '../_types';

export const useQuest = (quest: Quest, address?: string) => {
  const { data, isLoading, error, refetch } = useQuery<QuestStatusResult>({
    queryKey: ['questStatus', quest.id, address],
    queryFn: () => quest.checkStatus(address!),
    enabled: Boolean(address),
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    status: (data?.status ?? 'available') as QuestStatus,
    progress: data?.progress ?? 0,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
