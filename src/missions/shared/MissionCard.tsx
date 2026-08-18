import React from 'react';
import type { Mission, MissionStatus } from '../../types/Missions';
import ProgressBar from './ProgressBar';
import RewardBadge from './RewardBadge';
import ClaimButton from './ClaimButton';
import LevelBadge from './LevelBadge';
import styles from './MissionCard.module.css';

interface MissionCardProps {
  mission: Mission;
  status: MissionStatus;
  onClaim: () => void;
  children?: React.ReactNode;
  /** Opens the archetype modal. Only ever invoked for the archetype mission
   * card — see the onClick guard below. The modal itself decides what to
   * show (questionnaire vs. revealed archetype), so this stays clickable
   * regardless of claim status. Other mission cards ignore this prop. */
  onOpenArchetype?: () => void;
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

const MissionCard: React.FC<MissionCardProps> = ({ mission, status, onClaim, children, onOpenArchetype }) => {
  const isArchetype = mission.id === 'archetype';

  return (
    <div
      className={styles.card}
      onClick={isArchetype ? onOpenArchetype : undefined}
      style={isArchetype ? { cursor: 'pointer' } : undefined}
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
