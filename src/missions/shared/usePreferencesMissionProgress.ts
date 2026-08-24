import type { Mission } from '../../types/Missions';
import { usePreferencesDraft } from '../global/preferences/hooks/usePreferencesDraft';

// preferences mission answers live in localStorage until final on-chain
// submit (see usePreferencesDraft) — the server-side progress_current stays
// 0 the whole time, so the mission would otherwise show "0/7" no matter how
// far the player got. Read the draft directly and take the max with the
// server value: once submitted the draft is cleared (falls back to 0) and
// the server value (already at target) wins.
export function usePreferencesMissionProgress(mission: Mission, walletAddress?: string): number {
  const isPreferences = mission.id === 'preferences';
  const draft = usePreferencesDraft(isPreferences ? walletAddress : undefined);
  if (!isPreferences) return mission.progress.current;
  const answeredCount = draft.steps.filter((_, i) => draft.isStepComplete(i)).length;
  return Math.max(mission.progress.current, answeredCount);
}
