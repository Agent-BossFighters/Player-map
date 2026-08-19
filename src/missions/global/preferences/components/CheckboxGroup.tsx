import React from 'react';
import { FaCheck } from 'react-icons/fa';
import styles from './CheckboxGroup.module.css';

export interface CheckboxGroupOption {
  tripleId: string;
  label: string;
}

interface CheckboxGroupProps {
  options: CheckboxGroupOption[];
  selected: Set<string>;
  onToggle: (tripleId: string) => void;
}

// Independent checkboxes, arbitrary option count — unlike IntensitySelector/
// MultiRatingSelector (fixed 4-item for/against+intensity scale), this is a
// plain "pick any of N labeled options" primitive with boolean state.
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, selected, onToggle }) => {
  return (
    <div className={styles.grid} role="group">
      {options.map(option => {
        const isSelected = selected.has(option.tripleId);
        return (
          <button
            key={option.tripleId}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            className={[styles.option, isSelected ? styles.optionSelected : ''].join(' ')}
            onClick={() => onToggle(option.tripleId)}
          >
            <span className={styles.box}>
              {isSelected && <FaCheck className={styles.check} />}
            </span>
            <span className={styles.label}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CheckboxGroup;
