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
      {isLoading && <p className={styles.status}>Chargement de ton archétype...</p>}
      {!isLoading && (error || !archetype) && (
        <p className={styles.status}>Impossible de charger ton archétype pour le moment.</p>
      )}
      {!isLoading && !error && archetype && <ArchetypeCard archetype={archetype} />}
      <button type="button" className={styles.closeBtn} onClick={onClose}>
        Fermer
      </button>
    </div>
  );
};

export default ArchetypeBadge;
