import { useState, useEffect, useCallback, useRef } from 'react';
import { PREFERENCE_QUESTIONS, PreferenceQuestionConfig } from '../player-preferences-questionnaire.config';

// Key = question.id, value = array of selected tripleIds for that question.
export type PreferencesAnswers = Record<string, string[]>;

interface PreferencesDraftData {
  answers: PreferencesAnswers;
  currentStepIndex: number;
  maxReachedStepIndex: number;
}

const draftKey = (address: string): string => `playermap:quest-draft:preferences:${address}`;

function createEmptyDraft(): PreferencesDraftData {
  return { answers: {}, currentStepIndex: 0, maxReachedStepIndex: 0 };
}

function loadDraft(address: string): PreferencesDraftData {
  try {
    const raw = localStorage.getItem(draftKey(address));
    if (raw) return JSON.parse(raw) as PreferencesDraftData;
  } catch {
    // draft corrompu — on repart d'un draft vierge
  }
  return createEmptyDraft();
}

// Simpler sibling of useArchetypeDraft.ts: a single question type
// (multi_select, boolean set of tripleIds) needs none of the intensity/
// multi_rating branching, and a fixed question order is fine for a survey
// (no seeded shuffle needed — archetype's shuffle exists to counter-balance
// for/against bias, which doesn't apply to plain checkboxes).
export function usePreferencesDraft(address?: string) {
  const addressRef = useRef(address);
  const [draft, setDraft] = useState<PreferencesDraftData>(() =>
    address ? loadDraft(address) : createEmptyDraft()
  );

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

  const steps: PreferenceQuestionConfig[] = PREFERENCE_QUESTIONS;

  const toggleOption = useCallback((questionId: string, tripleId: string) => {
    setDraft(prev => {
      const current = new Set(prev.answers[questionId] ?? []);
      if (current.has(tripleId)) current.delete(tripleId);
      else current.add(tripleId);
      return { ...prev, answers: { ...prev.answers, [questionId]: [...current] } };
    });
  }, []);

  const setStepIndex = useCallback((index: number) => {
    setDraft(prev => ({
      ...prev,
      currentStepIndex: index,
      maxReachedStepIndex: Math.max(prev.maxReachedStepIndex, index),
    }));
  }, []);

  const isQuestionAnswered = useCallback((questionId: string): boolean => {
    return (draft.answers[questionId]?.length ?? 0) > 0;
  }, [draft.answers]);

  const isStepComplete = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex];
    if (!step) return false;
    return isQuestionAnswered(step.id);
  }, [steps, isQuestionAnswered]);

  const clear = useCallback(() => {
    if (address) localStorage.removeItem(draftKey(address));
    setDraft(createEmptyDraft());
  }, [address]);

  return {
    answers: draft.answers,
    toggleOption,
    currentStepIndex: draft.currentStepIndex,
    setStepIndex,
    maxReachedStepIndex: draft.maxReachedStepIndex,
    steps,
    clear,
    isStepComplete,
  };
}
