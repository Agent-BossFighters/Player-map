import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postClaimMission, ClaimError } from './claimApi';

interface UseClaimMissionProps {
  address?: string;
  getAccessToken?: () => Promise<string | null>;
}

export function useClaimMission({ address, getAccessToken }: UseClaimMissionProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (missionId: string) => {
      if (!getAccessToken) {
        throw new ClaimError(401, 'No auth available for this host');
      }
      return postClaimMission(missionId, getAccessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions', address] });
    },
    onError: (error) => {
      // 409 means our cached status was stale (already claimed elsewhere/earlier) —
      // refetch so the real server state (claimed) replaces it, instead of leaving
      // the button on CLAIM with an error underneath.
      if (error instanceof ClaimError && error.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['missions', address] });
      }
    },
  });

  return mutation;
}
