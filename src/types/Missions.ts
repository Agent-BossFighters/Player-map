// Player-map/src/types/Missions.ts
// MIRRORED in playermap-dashboard/packages/worker/src/types/missions.ts — these two files must stay in sync manually. No shared package: keeps cross-repo versioning simple while the Mission shape is still evolving. If you change a type here, update the other file in the same PR.

export type MissionType = 'daily' | 'global' | 'social'
export type MissionStatus = 'in_progress' | 'claimable' | 'claimed' | 'locked'

export interface BaseMission {
  id: string
  type: MissionType
  progress: { current: number; target: number }
  reward: { xp: number }
  status: MissionStatus
}

export interface DailyMission extends BaseMission {
  type: 'daily'
  title: string
  resetsAt: string
  // daily-login only — undefined for other daily missions (e.g. daily-vote).
  streak?: number
  longestStreak?: number
}

export interface GlobalMission extends BaseMission {
  type: 'global'
  level: number
  maxLevel: number
  titleType: string
  // Tiered missions only (e.g. player-votes) — preview of the reward for
  // the tier after the one currently claimable. Undefined once maxLevel is
  // reached, and always undefined for non-tiered global missions.
  nextTierXp?: number
}

export interface SocialMission extends BaseMission {
  type: 'social'
  description: string
  link: string
}

export type Mission = DailyMission | GlobalMission | SocialMission

// GET /missions response shape — worker-internal documentation only. Mirror
// of playermap-dashboard/packages/worker/src/types/missions.ts's
// MissionsResponse (that file has the full "keep in sync manually" note).
export interface MissionsResponse {
  missions: Mission[]
  totalXp: number
  // Cumulative XP actually earned per category (all-time, across every
  // cycle for repeating/daily missions) — distinct from summing reward.xp
  // over `missions`, which only reflects the current cycle's potential.
  categoryXp: { daily: number; global: number; social: number }
}
