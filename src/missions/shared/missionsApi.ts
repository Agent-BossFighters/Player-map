import { workerUrl } from '../../lib/workerClient';
import type { Mission } from '../../types/Missions';

export interface MissionsResponse {
  missions: Mission[];
  totalXp: number;
}

export async function fetchMissions(address: string): Promise<MissionsResponse> {
  const response = await fetch(workerUrl(`/api/player/${address}/missions`));
  if (!response.ok) {
    throw new Error(`Failed to fetch missions: ${response.status}`);
  }
  return response.json();
}
