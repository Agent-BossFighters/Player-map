import React from 'react';
import type { Mission, MissionStatus } from '../../types/Missions';
import ProgressBar from './ProgressBar';
import ClaimButton from './ClaimButton';
import LevelBadge from './LevelBadge';
import { usePreferencesMissionProgress } from './usePreferencesMissionProgress';
import { useArchetypeMissionProgress } from './useArchetypeMissionProgress';
import styles from './MissionRow.module.css';

// Same set as MissionCard.tsx — missions with their own questionnaire modal.
const CLICK_TO_LAUNCH_MISSION_IDS = new Set(['archetype', 'preferences']);

interface MissionRowProps {
  mission: Mission;
  status: MissionStatus;
  onClaim: () => void;
  /** Opens the mission's questionnaire modal — invoked with mission.id, only
   * for missions in CLICK_TO_LAUNCH_MISSION_IDS. Same guard as MissionCard;
   * the modal itself decides what to show, so this stays clickable
   * regardless of claim status. */
  onOpenQuestModal?: (missionId: string) => void;
  walletAddress?: string;
}

function rowTitle(mission: Mission): string {
  switch (mission.type) {
    case 'daily':
      return mission.title;
    case 'global':
      return mission.titleType;
    case 'social':
      return mission.description;
  }
}

const MissionRow: React.FC<MissionRowProps> = ({ mission, status, onClaim, onOpenQuestModal, walletAddress }) => {
  const isClickToLaunch = CLICK_TO_LAUNCH_MISSION_IDS.has(mission.id);
  const preferencesProgress = usePreferencesMissionProgress(mission, walletAddress);
  const archetypeProgress = useArchetypeMissionProgress(mission, walletAddress);
  const progressCurrent = mission.id === 'archetype' ? archetypeProgress : preferencesProgress;

  return (
    <div
      className={styles.row}
      onClick={isClickToLaunch ? () => onOpenQuestModal?.(mission.id) : undefined}
      style={isClickToLaunch ? { cursor: 'pointer' } : undefined}
    >
      <span className={styles.title}>{rowTitle(mission)}</span>

      <div className={styles.progressSlot}>
        <ProgressBar
          current={progressCurrent}
          target={mission.progress.target}
          colorVariant={mission.type}
        />
      </div>

      <div className={styles.claimSlot}>
        <ClaimButton
          status={status}
          missionType={mission.type}
          onClaim={onClaim}
          link={mission.type === 'social' ? mission.link : undefined}
        />
      </div>

      <span className={styles.xp}>{mission.reward.xp} XP</span>

      {mission.type === 'global' && <LevelBadge mission={mission} />}
    </div>
  );
};

export default MissionRow;
