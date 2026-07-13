// TODO: extract shared StepIndicator with PlayerCreationProgress if variants converge
import React from 'react';
import styles from './StepProgressBar.module.css';

interface StepProgressBarProps {
  totalSteps: number;
  currentStepIndex: number;
  maxReachedStepIndex: number;
  onStepClick: (index: number) => void;
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({
  totalSteps,
  currentStepIndex,
  maxReachedStepIndex,
  onStepClick,
}) => {
  return (
    <div className={styles.progressBar}>
      <div className={styles.progressSteps}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const isDone = i < currentStepIndex;
          const isActive = i === currentStepIndex;
          const isReachable = i <= maxReachedStepIndex;
          return (
            <button
              key={i}
              type="button"
              className={styles.progressStep}
              onClick={() => isReachable && onStepClick(i)}
              disabled={!isReachable}
              aria-label={`Étape ${i + 1} sur ${totalSteps}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={[
                  styles.stepCircle,
                  isDone ? styles.stepCircleDone : '',
                  isActive ? styles.stepCircleActive : '',
                ].join(' ')}
              >
                {isDone ? '✓' : i + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressBar;
