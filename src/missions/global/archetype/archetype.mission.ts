import { GlobalMission } from '../../../types/Missions';
import { fetchArchetypeCompletion } from './hooks/archetypeApi';

// TODO: placeholder reward — real xp value pending game-design input
const REWARD_XP = 100;
// TODO: placeholder — real title/rank naming pending game-design input
const TITLE_TYPE = 'archetype';

export async function getArchetypeMission(address: string): Promise<GlobalMission> {
  const completion = await fetchArchetypeCompletion(address);
  const questionnaireDone = completion.total > 0 && completion.votedCount >= completion.total;

  // No claim endpoint exists yet (see mission_state D1 table, not wired up) —
  // 'claimed' is unreachable until that lands. Done-but-unclaimed is 'claimable'.
  const status: GlobalMission['status'] = questionnaireDone ? 'claimable' : 'in_progress';

  return {
    id: 'archetype',
    type: 'global',
    progress: { current: completion.votedCount, target: completion.total },
    reward: { xp: REWARD_XP },
    status,
    level: 1,
    maxLevel: 1,
    titleType: TITLE_TYPE,
  };
}
