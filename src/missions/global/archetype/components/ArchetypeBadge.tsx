import React from 'react';
import ArchetypeCard from './ArchetypeCard';
import styles from './ArchetypeBadge.module.css';
import { usePlayerArchetype } from '../hooks/usePlayerArchetype';

interface ArchetypeBadgeProps {
  address: string;
  onClose: () => void;
}

const ArchetypeBadge: React.FC<ArchetypeBadgeProps> = ({ address, onClose }) => {
  const { archetype, isLoading, error } = usePlayerArchetype(address);

  return (
    <div className={styles.wrapper}>
      {isLoading && <p className={styles.status}>Loading your archetype...</p>}
      {!isLoading && (error || !archetype) && (
        <p className={styles.status}>Failed to load your archetype right now.</p>
      )}
      {!isLoading && !error && archetype && <ArchetypeCard archetype={archetype} />}
      <button type="button" className={styles.closeBtn} onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default ArchetypeBadge;
