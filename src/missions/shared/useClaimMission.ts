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
  });

  return mutation;
}
