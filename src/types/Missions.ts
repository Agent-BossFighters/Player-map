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
}

export interface GlobalMission extends BaseMission {
  type: 'global'
  level: number
  maxLevel: number
  titleType: string
}

export interface SocialMission extends BaseMission {
  type: 'social'
  description: string
  link: string
}

export type Mission = DailyMission | GlobalMission | SocialMission
