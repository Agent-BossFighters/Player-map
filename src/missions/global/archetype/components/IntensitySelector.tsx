import React from 'react';
import styles from './IntensitySelector.module.css';
import { AnswerCurve, AnswerIntensity, AnswerValue } from '../hooks/useArchetypeDraft';

interface IntensitySelectorProps {
  value: AnswerValue | null | undefined;
  onChange: (value: AnswerValue) => void;
  compact?: boolean;
}

const OPTIONS: Array<{ curve: AnswerCurve; intensity: AnswerIntensity; icon: string; label: string }> = [
  { curve: 'against', intensity: 'fort', icon: '👎👎', label: 'Fortement contre' },
  { curve: 'against', intensity: 'faible', icon: '👎', label: 'Contre' },
  { curve: 'for', intensity: 'faible', icon: '👍', label: 'Pour' },
  { curve: 'for', intensity: 'fort', icon: '👍👍', label: 'Fortement pour' },
];

const IntensitySelector: React.FC<IntensitySelectorProps> = ({ value, onChange, compact = false }) => {
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
        const isSelected = value?.curve === opt.curve && value?.intensity === opt.intensity;
        return (
          <button
            key={`${opt.curve}-${opt.intensity}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={[styles.btn, isSelected ? styles.btnSelected : ''].join(' ')}
            onClick={() => onChange({ curve: opt.curve, intensity: opt.intensity })}
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

export default IntensitySelector;
