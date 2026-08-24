import type { Mission } from '../../types/Missions';
import { useArchetypeDraft } from '../global/archetype/hooks/useArchetypeDraft';

// Same rationale as usePreferencesMissionProgress: archetype answers live in
// localStorage until final on-chain submit, so server-side progress_current
// stays 0 the whole time. Read the draft directly and take the max with the
// server value — once submitted the draft is cleared (falls back to 0) and
// the server value (already reflecting votedCount) wins.
export function useArchetypeMissionProgress(mission: Mission, walletAddress?: string): number {
  const isArchetype = mission.id === 'archetype';
  const draft = useArchetypeDraft(isArchetype ? walletAddress : undefined);
  if (!isArchetype) return mission.progress.current;
  return Math.max(mission.progress.current, draft.answeredQuestionCount);
}
