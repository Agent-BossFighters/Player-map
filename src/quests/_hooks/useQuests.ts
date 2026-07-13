import { useQueries } from '@tanstack/react-query';
import { QUESTS } from '../_registry';
import { Quest, QuestStatus, QuestStatusResult } from '../_types';

export interface QuestWithStatus {
  quest: Quest;
  status: QuestStatus;
  progress: number;
  isLoading: boolean;
  error: Error | null;
}

export const useQuests = (address?: string): QuestWithStatus[] => {
  const results = useQueries({
    queries: QUESTS.map(quest => ({
      queryKey: ['questStatus', quest.id, address],
      queryFn: () => quest.checkStatus(address!),
      enabled: Boolean(address),
      staleTime: 30 * 1000,
      retry: 1,
    })),
  });

  return QUESTS.map((quest, i) => {
    const result = results[i];
    const data = result.data as QuestStatusResult | undefined;
    return {
      quest,
      status: (data?.status ?? 'available') as QuestStatus,
      progress: data?.progress ?? 0,
      isLoading: result.isLoading,
      error: result.error as Error | null,
    };
  });
};
