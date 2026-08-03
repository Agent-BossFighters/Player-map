import React from 'react';
import type { Mission, MissionStatus } from '../../types/Missions';
import ProgressBar from './ProgressBar';
import RewardBadge from './RewardBadge';
import ClaimButton from './ClaimButton';
import styles from './MissionCard.module.css';

interface MissionCardProps {
  mission: Mission;
  status: MissionStatus;
  onClaim: () => void;
  children?: React.ReactNode;
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

const MissionCard: React.FC<MissionCardProps> = ({ mission, status, onClaim, children }) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <span className={styles.title}>{missionHeader(mission)}</span>
      <RewardBadge xp={mission.reward.xp} />
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

export default MissionCard;
