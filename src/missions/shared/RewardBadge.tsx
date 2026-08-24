import React from 'react';
import styles from './RewardBadge.module.css';

interface RewardBadgeProps {
  xp: number;
}

const RewardBadge: React.FC<RewardBadgeProps> = ({ xp }) => (
  <span className={styles.badge}>{xp} XP</span>
);

export default RewardBadge;
