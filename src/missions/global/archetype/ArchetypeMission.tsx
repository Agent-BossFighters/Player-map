import React, { useCallback, useEffect, useRef, useState } from 'react';
import StepProgressBar from './components/StepProgressBar';
import IntensitySelector from './components/IntensitySelector';
import MultiRatingSelector from './components/MultiRatingSelector';
import ArchetypeBadge from './components/ArchetypeBadge';
import ArchetypeReveal from './components/ArchetypeReveal';
import { useArchetypeCompletion } from './hooks/useArchetypeCompletion';
import { useArchetypeDraft, AnswerValue, MultiRatingAnswer } from './hooks/useArchetypeDraft';
import { useArchetypeSubmission } from './hooks/useArchetypeSubmission';
import { usePlayerArchetype } from './hooks/usePlayerArchetype';
import { ArchetypeQuestion } from './archetype-questionnaire.config';
import styles from './ArchetypeMission.module.css';

interface ArchetypeMissionProps {
  isOpen: boolean;
  walletConnected?: any;
  walletAddress?: string;
  onClose: () => void;
}

type FlowPhase = 'intro' | 'steps' | 'submitting' | 'reveal';

const introSeenKey = (address: string): string => `playermap:archetype-intro-seen:${address}`;

function hasSeenIntro(address: string): boolean {
  try {
    return localStorage.getItem(introSeenKey(address)) !== null;
  } catch {
    return true; // localStorage unavailable — don't block the flow on the intro
  }
}

function markIntroSeen(address: string): void {
  try {
    localStorage.setItem(introSeenKey(address), 'true');
  } catch {
    // best-effort — a failed write just means the intro may reappear once
  }
}

const ArchetypeMission: React.FC<ArchetypeMissionProps> = ({
  isOpen,
  walletConnected,
  walletAddress,
  onClose,
}) => {
  const { completion, isLoading: completionLoading } = useArchetypeCompletion(walletAddress);

  const [phase, setPhase] = useState<FlowPhase>('steps');

  // One-shot: decide intro-vs-steps the first time the modal is actually
  // open with a known walletAddress (not at raw component mount — this
  // component stays mounted with isOpen=false before wallet connects, and
  // waiting avoids deciding on a still-empty address). Read/mark "seen"
  // here, before useArchetypeDraft mounts below — that hook writes an empty
  // draft to localStorage on its own first effect, which would make a
  // later "does a draft exist" check useless as a first-visit signal.
  // Runs only once per mount, so reopening later (e.g. mid-'reveal') never
  // resets phase back to 'intro'/'steps'.
  const introDecidedRef = useRef(false);
  useEffect(() => {
    if (introDecidedRef.current || !isOpen || !walletAddress) return;
    introDecidedRef.current = true;
    if (!hasSeenIntro(walletAddress)) {
      markIntroSeen(walletAddress);
      setPhase('intro');
    }
  }, [isOpen, walletAddress]);

  const draft = useArchetypeDraft(walletAddress);
  const { submit, isSubmitting, error: submitError } = useArchetypeSubmission({
    walletConnected,
    walletAddress,
  });
  const { archetype, refetch: refetchArchetype } = usePlayerArchetype(walletAddress);

  const steps = draft.steps;
  const currentStep = steps[draft.currentStepIndex];
  const isLastStep = draft.currentStepIndex === steps.length - 1;

  const advanceOrSubmit = useCallback(async () => {
    if (isLastStep) {
      setPhase('submitting');
      const success = await submit(draft.answers);
      if (success) {
        draft.clear();
        await refetchArchetype();
        setPhase('reveal');
      }
      // en cas d'échec on reste en 'submitting' : ArchetypeReveal affiche l'erreur + retry
    } else {
      draft.setStepIndex(draft.currentStepIndex + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLastStep, submit, draft, refetchArchetype]);

  const handleAutoAdvanceAnswer = useCallback((question: ArchetypeQuestion, value: AnswerValue) => {
    draft.setAnswer(question.id, value);
    setTimeout(() => {
      advanceOrSubmit();
    }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, advanceOrSubmit]);

  const handleRetry = useCallback(() => {
    setPhase('steps');
  }, []);

  if (!isOpen || !walletAddress) return null;

  if (completionLoading) {
    return (
      <div className={styles.overlay}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className={styles.overlay}>
        <div className={styles.stepContent}>
          <p className={styles.questionText}>
            Before you dive into the adventure, we've got one question for you: what kind of
            player are you, really? This quick questionnaire helps us understand your style —
            collector, competitor, or just here to unwind. Takes 2 minutes, and it kicks off your
            player profile on Player Map.
          </p>
        </div>
        <div className={styles.navRow}>
          <button type="button" className={styles.prevBtn} onClick={onClose}>
            Later
          </button>
          <button type="button" className={styles.nextBtn} onClick={() => setPhase('steps')}>
            Start
          </button>
        </div>
      </div>
    );
  }

  if (completion?.completed) {
    return (
      <div className={styles.overlay}>
        <ArchetypeBadge address={walletAddress} onClose={onClose} />
      </div>
    );
  }

  if (phase === 'submitting' || phase === 'reveal') {
    return (
      <div className={styles.overlay}>
        <ArchetypeReveal
          isSubmitting={phase === 'submitting' && isSubmitting}
          archetype={phase === 'reveal' ? archetype : null}
          submitError={submitError}
          onRetry={handleRetry}
          onClose={onClose}
        />
      </div>
    );
  }

  if (!currentStep) return null;

  const isSingleQuestionStep = currentStep.questions.length === 1;
  const singleQuestion = currentStep.questions[0];
  // Auto-advance uniquement pour une step à 1 question intensity_for_against
  // (un seul choix binaire, sans ambiguïté). Une step multi_rating à 1 question
  // peut porter plusieurs options — on garde le bouton "Suivant" pour laisser
  // le temps de toutes les évaluer.
  const isAutoAdvanceStep = isSingleQuestionStep && singleQuestion.type === 'intensity_for_against';
  const tableQuestionType = !isSingleQuestionStep ? currentStep.questions[0].type : null;

  const getMultiRatingAnswer = (questionId: string): MultiRatingAnswer =>
    (draft.answers[questionId] as MultiRatingAnswer | undefined) ?? {};

  return (
    <div className={styles.overlay}>
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
        ×
      </button>

      <div className={styles.stepContent}>
        {currentStep.title && <h2 className={styles.stepTitle}>{currentStep.title}</h2>}

        {isSingleQuestionStep ? (
          singleQuestion.type === 'intensity_for_against' ? (
            <div className={styles.standaloneQuestion}>
              <p className={styles.questionText}>{singleQuestion.question}</p>
              <IntensitySelector
                value={draft.answers[singleQuestion.id] as AnswerValue | undefined}
                onChange={(value) => handleAutoAdvanceAnswer(singleQuestion, value)}
              />
            </div>
          ) : (
            <div className={styles.standaloneQuestion}>
              <p className={styles.questionText}>{singleQuestion.question}</p>
              <div className={styles.optionsList}>
                {singleQuestion.options.map(option => {
                  const current = getMultiRatingAnswer(singleQuestion.id);
                  return (
                    <div key={option.tripleId} className={styles.optionRow}>
                      <span className={styles.optionLabel}>{option.label}</span>
                      <MultiRatingSelector
                        value={current[option.tripleId]}
                        onChange={(value) =>
                          draft.setAnswer(singleQuestion.id, { ...current, [option.tripleId]: value })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span className={styles.tableHeaderSpacer} />
              {(tableQuestionType === 'intensity_for_against'
                ? ['👎👎', '👎', '👍', '👍👍']
                : ['👎', '—', '👍', '👍👍']
              ).map((icon, i) => (
                <span key={i} className={styles.tableHeaderIcon} aria-hidden="true">
                  {icon}
                </span>
              ))}
            </div>

            {tableQuestionType === 'intensity_for_against'
              ? currentStep.questions.map(question => {
                  if (question.type !== 'intensity_for_against') return null;
                  return (
                    <div key={question.id} className={styles.tableRow}>
                      <span className={styles.tableRowLabel}>{question.question}</span>
                      <IntensitySelector
                        compact
                        value={draft.answers[question.id] as AnswerValue | undefined}
                        onChange={(value) => draft.setAnswer(question.id, value)}
                      />
                    </div>
                  );
                })
              : currentStep.questions.map(question => {
                  if (question.type !== 'multi_rating') return null;
                  const current = getMultiRatingAnswer(question.id);
                  return question.options.map(option => (
                    <div key={option.tripleId} className={styles.tableRow}>
                      <span className={styles.tableRowLabel}>{option.label}</span>
                      <MultiRatingSelector
                        compact
                        value={current[option.tripleId]}
                        onChange={(value) =>
                          draft.setAnswer(question.id, { ...current, [option.tripleId]: value })
                        }
                      />
                    </div>
                  ));
                })}
          </div>
        )}
      </div>

      <StepProgressBar
        totalSteps={steps.length}
        currentStepIndex={draft.currentStepIndex}
        maxReachedStepIndex={draft.maxReachedStepIndex}
        onStepClick={draft.setStepIndex}
      />

      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.prevBtn}
          onClick={() => draft.setStepIndex(draft.currentStepIndex - 1)}
          disabled={draft.currentStepIndex === 0}
        >
          Précédent
        </button>

        {!isAutoAdvanceStep && (
          <button
            type="button"
            className={styles.nextBtn}
            onClick={advanceOrSubmit}
            disabled={!draft.isStepComplete(draft.currentStepIndex)}
          >
            {isLastStep ? 'Terminer' : 'Suivant'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ArchetypeMission;
