import React from 'react';
import { FaLock, FaCheck } from 'react-icons/fa';
import type { Mission, MissionStatus } from '../../types/Missions';
import styles from './ClaimButton.module.css';

interface ClaimButtonProps {
  status: MissionStatus;
  missionType: Mission['type'];
  onClaim: () => void;
  link?: string;
}

const ClaimButton: React.FC<ClaimButtonProps> = ({ status, missionType, onClaim, link }) => {
  if (status === 'in_progress') {
    return null;
  }

  if (status === 'claimed') {
    return (
      <button type="button" className={styles.claimed} disabled>
        <FaCheck className={styles.checkIcon} />
        CLAIMED
      </button>
    );
  }

  if (status === 'locked') {
    return (
      <button type="button" className={styles.locked} disabled>
        <FaLock className={styles.lockIcon} />
        LOCKED
      </button>
    );
  }

  // status === 'claimable'
  if (missionType === 'social') {
    return (
      <button
        type="button"
        className={styles.action}
        onClick={() => link && window.open(link, '_blank', 'noopener,noreferrer')}
      >
        LINK
      </button>
    );
  }

  return (
    <button type="button" className={styles.action} onClick={onClaim}>
      CLAIM
    </button>
  );
};

export default ClaimButton;
