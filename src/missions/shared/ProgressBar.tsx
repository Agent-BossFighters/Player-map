import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  target: number;
  colorVariant: 'daily' | 'global' | 'social';
}

const VARIANT_CLASS: Record<ProgressBarProps['colorVariant'], string> = {
  daily: styles.fillDaily,
  global: styles.fillGlobal,
  social: styles.fillSocial,
};

const ProgressBar: React.FC<ProgressBarProps> = ({ current, target, colorVariant }) => {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div
          className={[styles.fill, VARIANT_CLASS[colorVariant]].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={styles.label}>{current}/{target}</span>
    </div>
  );
};

export default ProgressBar;
