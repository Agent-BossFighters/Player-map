import React from 'react';
import type { Mission, MissionStatus } from '../../types/Missions';
import ProgressBar from './ProgressBar';
import ClaimButton from './ClaimButton';
import LevelBadge from './LevelBadge';
import styles from './MissionRow.module.css';

interface MissionRowProps {
  mission: Mission;
  status: MissionStatus;
  onClaim: () => void;
  /** Opens the archetype modal — only invoked for the archetype mission row,
   * same guard as MissionCard. The modal itself decides what to show (the
   * questionnaire, or the revealed archetype once completed), so this stays
   * clickable regardless of claim status. */
  onOpenArchetype?: () => void;
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

const MissionRow: React.FC<MissionRowProps> = ({ mission, status, onClaim, onOpenArchetype }) => {
  const isArchetype = mission.id === 'archetype';

  return (
    <div
      className={styles.row}
      onClick={isArchetype ? onOpenArchetype : undefined}
      style={isArchetype ? { cursor: 'pointer' } : undefined}
    >
      <span className={styles.title}>{rowTitle(mission)}</span>

      <div className={styles.progressSlot}>
        <ProgressBar
          current={mission.progress.current}
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
