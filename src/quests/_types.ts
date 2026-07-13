export type QuestStatus = 'available' | 'in_progress' | 'completed';

export interface QuestRewards {
  xp?: number;
  badge?: string;
}

export interface QuestStatusResult {
  status: QuestStatus;
  progress: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'daily' | 'milestone';
  rewards?: QuestRewards;
  checkStatus: (address: string) => Promise<QuestStatusResult>;
}
