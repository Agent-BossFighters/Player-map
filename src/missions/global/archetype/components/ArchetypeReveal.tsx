import React, { useEffect, useState } from 'react';
import ArchetypeCard from './ArchetypeCard';
import styles from './ArchetypeReveal.module.css';
import { PlayerArchetypeResponse } from '../hooks/archetypeApi';

const BUILD_UP_MESSAGES = [
  'Analyzing your answers...',
  'Your dominant archetype...',
];

interface ArchetypeRevealProps {
  isSubmitting: boolean;
  archetype: PlayerArchetypeResponse | null;
  submitError: string | null;
  onRetry: () => void;
  onClose: () => void;
}

const ArchetypeReveal: React.FC<ArchetypeRevealProps> = ({
  isSubmitting,
  archetype,
  submitError,
  onRetry,
  onClose,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isSubmitting) return;
    setMessageIndex(0);
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % BUILD_UP_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isSubmitting]);

  if (submitError) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.error}>{submitError}</p>
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  if (isSubmitting || !archetype) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.buildUp}>{BUILD_UP_MESSAGES[messageIndex]}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <ArchetypeCard archetype={archetype} animate />
      <button type="button" className={styles.closeBtn} onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default ArchetypeReveal;
