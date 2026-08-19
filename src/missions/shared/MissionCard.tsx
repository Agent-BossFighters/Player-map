import React from 'react';
import type { Mission, MissionStatus } from '../../types/Missions';
import ProgressBar from './ProgressBar';
import RewardBadge from './RewardBadge';
import ClaimButton from './ClaimButton';
import LevelBadge from './LevelBadge';
import styles from './MissionCard.module.css';

// Missions with their own questionnaire modal, opened by clicking the card
// itself rather than (or in addition to) the CLAIM button — the modal
// decides what to show (questionnaire, in-progress, or already-completed),
// so the card stays clickable regardless of claim status.
const CLICK_TO_LAUNCH_MISSION_IDS = new Set(['archetype', 'preferences']);

interface MissionCardProps {
  mission: Mission;
  status: MissionStatus;
  onClaim: () => void;
  children?: React.ReactNode;
  /** Opens the mission's questionnaire modal — invoked with mission.id, only
   * for missions in CLICK_TO_LAUNCH_MISSION_IDS. */
  onOpenQuestModal?: (missionId: string) => void;
}

function missionHeader(mission: Mission): string {
  switch (mission.type) {
    case 'daily':
      return mission.title;
    case 'global':
      return `Level ${mission.level} — ${mission.titleType}`;
    case 'social':
      return mission.description;
  }
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, status, onClaim, children, onOpenQuestModal }) => {
  const isClickToLaunch = CLICK_TO_LAUNCH_MISSION_IDS.has(mission.id);

  return (
    <div
      className={styles.card}
      onClick={isClickToLaunch ? () => onOpenQuestModal?.(mission.id) : undefined}
      style={isClickToLaunch ? { cursor: 'pointer' } : undefined}
    >
      <div className={styles.header}>
        <span className={styles.title}>{missionHeader(mission)}</span>
        <div className={styles.badges}>
          {mission.type === 'global' && <LevelBadge mission={mission} />}
          <RewardBadge xp={mission.reward.xp} />
        </div>
      </div>

      <ProgressBar
        current={mission.progress.current}
        target={mission.progress.target}
        colorVariant={mission.type}
      />

      {children && <div className={styles.slot}>{children}</div>}

      <div className={styles.footer}>
        <ClaimButton
          status={status}
          missionType={mission.type}
          onClaim={onClaim}
          link={mission.type === 'social' ? mission.link : undefined}
        />
      </div>
    </div>
  );
};

export default MissionCard;
