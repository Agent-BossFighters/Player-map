import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ARCHETYPE_STEPS, ArchetypeStep, ArchetypeQuestion } from '../archetype-questionnaire.config';
import { shuffleStepsWithSeed } from './shuffle';

export type AnswerCurve = 'for' | 'against';
export type AnswerIntensity = 'faible' | 'fort';

export interface AnswerValue {
  curve: AnswerCurve;
  intensity: AnswerIntensity;
}

// Clé = tripleId de l'option (multi_rating uniquement)
export type MultiRatingAnswer = Record<string, AnswerValue | null>;

// Clé = question.id, JAMAIS le tripleId — permet de changer un tripleId sans
// casser les drafts en cours.
export type ArchetypeAnswers = Record<string, AnswerValue | MultiRatingAnswer>;

interface ArchetypeDraftData {
  seed: number;
  answers: ArchetypeAnswers;
  currentStepIndex: number;
  maxReachedStepIndex: number;
}

const draftKey = (address: string): string => `playermap:quest-draft:preferences:${address}`;

function createEmptyDraft(): ArchetypeDraftData {
  return {
    seed: Math.floor(Math.random() * 2 ** 31),
    answers: {},
    currentStepIndex: 0,
    maxReachedStepIndex: 0,
  };
}

function loadDraft(address: string): ArchetypeDraftData {
  try {
    const raw = localStorage.getItem(draftKey(address));
    if (raw) return JSON.parse(raw) as ArchetypeDraftData;
  } catch {
    // draft corrompu — on repart d'un draft vierge
  }
  return createEmptyDraft();
}

function isMultiRatingAnswer(value: AnswerValue | MultiRatingAnswer): value is MultiRatingAnswer {
  return !('curve' in value);
}

export function useArchetypeDraft(address?: string, visibleTripleIds?: string[]) {
  const addressRef = useRef(address);
  const [draft, setDraft] = useState<ArchetypeDraftData>(() =>
    address ? loadDraft(address) : createEmptyDraft()
  );

  // Recharge le draft si l'adresse change pendant que la modale reste montée
  // (changement de wallet en cours de session).
  useEffect(() => {
    if (address && address !== addressRef.current) {
      addressRef.current = address;
      setDraft(loadDraft(address));
    }
  }, [address]);

  useEffect(() => {
    if (!address) return;
    localStorage.setItem(draftKey(address), JSON.stringify(draft));
  }, [address, draft]);

  // visibleTripleIds narrows the flow to just the not-yet-voted question(s)
  // (e.g. re-prompting after a partial submit) — filtered here, inside the
  // hook, so isStepComplete/currentStepIndex stay consistent with the same
  // reduced array rather than indexing into two different step lists.
  const steps: ArchetypeStep[] = useMemo(() => {
    const shuffled = shuffleStepsWithSeed(ARCHETYPE_STEPS, draft.seed);
    if (!visibleTripleIds) return shuffled;
    const allowed = new Set(visibleTripleIds);
    const questionHasVisibleTriple = (q: ArchetypeQuestion): boolean =>
      q.type === 'intensity_for_against'
        ? allowed.has(q.tripleId)
        : q.options.some(opt => allowed.has(opt.tripleId));
    return shuffled.filter(step => step.questions.some(questionHasVisibleTriple));
  }, [draft.seed, visibleTripleIds]);

  const setAnswer = useCallback((questionId: string, value: AnswerValue | MultiRatingAnswer) => {
    setDraft(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, []);

  const setStepIndex = useCallback((index: number) => {
    setDraft(prev => ({
      ...prev,
      currentStepIndex: index,
      maxReachedStepIndex: Math.max(prev.maxReachedStepIndex, index),
    }));
  }, []);

  const isQuestionAnswered = useCallback((question: ArchetypeQuestion): boolean => {
    const answer = draft.answers[question.id];
    if (!answer) return false;
    if (question.type === 'intensity_for_against') {
      return !isMultiRatingAnswer(answer);
    }
    // multi_rating : au moins une option non-null
    if (!isMultiRatingAnswer(answer)) return false;
    return question.options.some(opt => Boolean(answer[opt.tripleId]));
  }, [draft.answers]);

  const isStepComplete = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex];
    if (!step) return false;
    return step.questions.every(isQuestionAnswered);
  }, [steps, isQuestionAnswered]);

  const isComplete = useMemo(
    () => steps.every((_, i) => isStepComplete(i)),
    [steps, isStepComplete]
  );

  const clear = useCallback(() => {
    if (address) localStorage.removeItem(draftKey(address));
    setDraft(createEmptyDraft());
  }, [address]);

  return {
    answers: draft.answers,
    setAnswer,
    currentStepIndex: draft.currentStepIndex,
    setStepIndex,
    maxReachedStepIndex: draft.maxReachedStepIndex,
    seed: draft.seed,
    steps,
    clear,
    isStepComplete,
    isComplete,
  };
}
