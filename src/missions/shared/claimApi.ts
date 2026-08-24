import { workerUrl } from '../../lib/workerClient';

export interface ClaimMissionResponse {
  claimed: true;
  xpAwarded: number;
  totalXp: number;
}

export class ClaimError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function postClaimMission(
  missionId: string,
  getAccessToken: () => Promise<string | null>
): Promise<ClaimMissionResponse> {
  const token = await getAccessToken();
  if (!token) {
    throw new ClaimError(401, 'Not authenticated');
  }

  const response = await fetch(workerUrl(`/api/player/missions/${missionId}/claim`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ClaimError(response.status, body.error ?? `Claim failed (${response.status})`);
  }

  return response.json();
}
