import React from 'react';
import styles from './ArchetypeCard.module.css';
import { PlayerArchetypeResponse } from '../hooks/archetypeApi';

interface ArchetypeCardProps {
  archetype: PlayerArchetypeResponse;
  animate?: boolean;
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ archetype, animate = false }) => {
  return (
    <div className={[styles.card, animate ? styles.cardAnimate : ''].join(' ')}>
      <p className={styles.eyebrow}>Your archetype</p>
      <h2 className={styles.title}>
        {animate
          ? archetype.label.split('').map((char, i) => (
              <span key={i} className={styles.letter} style={{ animationDelay: `${i * 0.04}s` }}>
                {char === ' ' ? ' ' : char}
              </span>
            ))
          : archetype.label}
      </h2>
      <p className={styles.description}>{archetype.description}</p>
    </div>
  );
};

export default ArchetypeCard;
