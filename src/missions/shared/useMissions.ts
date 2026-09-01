import { useQuery } from '@tanstack/react-query';
import { fetchMissions } from './missionsApi';
import type { DailyMission, GlobalMission, SocialMission } from '../../types/Missions';

interface GroupedMissions {
  daily: DailyMission[];
  global: GlobalMission[];
  social: SocialMission[];
}

export function useMissions(address?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['missions', address],
    queryFn: () => fetchMissions(address!),
    enabled: Boolean(address),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const missions = data?.missions ?? [];

  const grouped: GroupedMissions = {
    daily: missions.filter((m): m is DailyMission => m.type === 'daily'),
    global: missions.filter((m): m is GlobalMission => m.type === 'global'),
    social: missions.filter((m): m is SocialMission => m.type === 'social'),
  };

  return {
    grouped,
    totalXp: data?.totalXp ?? 0,
    categoryXp: data?.categoryXp ?? { daily: 0, global: 0, social: 0 },
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
