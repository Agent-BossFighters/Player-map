import React from 'react';
import styles from './MultiRatingSelector.module.css';
import { AnswerValue } from '../hooks/useArchetypeDraft';

interface MultiRatingSelectorProps {
  value: AnswerValue | null | undefined;
  onChange: (value: AnswerValue | null) => void;
  compact?: boolean;
}

const OPTIONS: Array<{ value: AnswerValue | null; icon: string; label: string }> = [
  { value: { curve: 'against', intensity: 'faible' }, icon: '👎', label: 'Disagree' },
  { value: null, icon: '—', label: 'Neutral / No opinion' },
  { value: { curve: 'for', intensity: 'faible' }, icon: '👍', label: 'Agree' },
  { value: { curve: 'for', intensity: 'fort' }, icon: '👍👍', label: 'Strongly agree' },
];

function isSameAnswer(a: AnswerValue | null, b: AnswerValue | null | undefined): boolean {
  if (a === null) return b == null;
  return b?.curve === a.curve && b?.intensity === a.intensity;
}

const MultiRatingSelector: React.FC<MultiRatingSelectorProps> = ({ value, onChange, compact = false }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = (index + delta + OPTIONS.length) % OPTIONS.length;
      const group = e.currentTarget.parentElement;
      (group?.children[next] as HTMLElement | undefined)?.focus();
    }
  };

  return (
    <div className={[styles.group, compact ? styles.groupCompact : ''].join(' ')} role="radiogroup">
      {OPTIONS.map((opt, i) => {
        const isSelected = isSameAnswer(opt.value, value);
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={[styles.btn, isSelected ? styles.btnSelected : ''].join(' ')}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            <span aria-hidden="true">{opt.icon}</span>
            <span className={styles.srOnly}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MultiRatingSelector;
