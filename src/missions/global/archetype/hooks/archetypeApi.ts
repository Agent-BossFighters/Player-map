// Contrat de réponse stable, respecté à l'identique en mock et en fetch réel —
// zéro refacto des hooks/consommateurs quand le worker sera branché.

import { workerUrl } from '../../../../lib/workerClient';

export interface ArchetypeCompletionResponse {
  completed: boolean;
  votedCount: number;
  total: number;
  // tripleIds still missing a valid on-chain vote — used to re-prompt only
  // the outstanding question(s) instead of the whole questionnaire.
  missingTripleIds: string[];
}

export interface ArchetypeBadgeCosmetic {
  id: string;
  name: string;
  image_url: string;
}

export interface PlayerArchetypeResponse {
  archetype: string;
  label: string;
  description: string;
  cosmetics: ArchetypeBadgeCosmetic[];
}

const TOTAL_QUESTIONS = 15;

const MOCK_ARCHETYPES: PlayerArchetypeResponse[] = [
  { archetype: 'collector', label: 'The Collector', description: 'Stub description — real logic lives on the worker.', cosmetics: [] },
  { archetype: 'strategist', label: 'The Strategist', description: 'Stub description — real logic lives on the worker.', cosmetics: [] },
  { archetype: 'socializer', label: 'The Socializer', description: 'Stub description — real logic lives on the worker.', cosmetics: [] },
  { archetype: 'competitor', label: 'The Competitor', description: 'Stub description — real logic lives on the worker.', cosmetics: [] },
  { archetype: 'explorer', label: 'The Explorer', description: 'Stub description — real logic lives on the worker.', cosmetics: [] },
  { archetype: 'creator', label: 'The Creator', description: 'Stub description — real logic lives on the worker.', cosmetics: [] },
  { archetype: 'grinder', label: 'The Grinder', description: 'Stub description — real logic lives on the worker.', cosmetics: [] },
];

function hashAddress(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const isMockEnabled = (): boolean => import.meta.env.VITE_USE_MOCK_ARCHETYPE_API === 'true';
const isForcedCompleted = (): boolean => import.meta.env.VITE_MOCK_ARCHETYPE_FORCE_COMPLETED === 'true';

export async function fetchArchetypeCompletion(address: string): Promise<ArchetypeCompletionResponse> {
  if (isMockEnabled()) {
    await delay(300);
    return isForcedCompleted()
      ? { completed: true, votedCount: TOTAL_QUESTIONS, total: TOTAL_QUESTIONS, missingTripleIds: [] }
      : { completed: false, votedCount: 0, total: TOTAL_QUESTIONS, missingTripleIds: [] };
  }

  const response = await fetch(workerUrl(`/api/player/${address}/archetype/completion`));
  if (!response.ok) {
    throw new Error(`Failed to fetch archetype completion: ${response.status}`);
  }
  return response.json();
}

export async function fetchPlayerArchetype(address: string): Promise<PlayerArchetypeResponse | null> {
  if (isMockEnabled()) {
    await delay(500);
    if (!isForcedCompleted()) return null; // équivalent 404 : pas encore complété
    return MOCK_ARCHETYPES[hashAddress(address) % MOCK_ARCHETYPES.length];
  }

  const response = await fetch(workerUrl(`/api/player/${address}/archetype`));
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch player archetype: ${response.status}`);
  }
  return response.json();
}
