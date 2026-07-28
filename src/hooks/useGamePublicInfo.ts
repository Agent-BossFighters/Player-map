import { useWorkerResource } from './useWorkerResource';
import { workerKeys } from './workerQueryKeys';
import type { DevStep } from '../config/devStep';

export interface GamePublicInfo {
  dev_step: DevStep | null;
  game_score: {
    overall: number;
    status: 'approved' | 'pending' | 'rejected';
  };
}

interface GamePublicInfoResponse {
  success: boolean;
  data: GamePublicInfo;
}

export function useGamePublicInfo(atomId?: string) {
  const { data, isLoading, error } = useWorkerResource<GamePublicInfoResponse>(
    workerKeys.gamePublicInfo(atomId ?? ''),
    `/api/games/${atomId}/public`,
    Boolean(atomId),
  );

  return {
    info: data?.data ?? null,
    isLoading,
    error: error as Error | null,
  };
}
