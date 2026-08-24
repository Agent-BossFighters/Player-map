import React from 'react';
import type { GlobalMission } from '../../types/Missions';
import styles from './LevelBadge.module.css';

interface LevelBadgeProps {
  mission: GlobalMission;
}

// Renders nothing until a global mission actually has more than one level —
// today maxLevel is always 1 (no tiered missions yet), so this is a no-op in
// production. Once real levels land server-side, this starts rendering with
// no frontend change needed.
const LevelBadge: React.FC<LevelBadgeProps> = ({ mission }) => {
  if (mission.maxLevel <= 1) return null;

  return (
    <span className={styles.badge}>
      LEVEL {mission.level} ({mission.progress.current}/{mission.progress.target})
    </span>
  );
};

export default LevelBadge;
