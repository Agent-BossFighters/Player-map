// Contrat de réponse stable, respecté à l'identique en mock et en fetch réel —
// zéro refacto des hooks/consommateurs quand le worker sera branché.

export interface ArchetypeCompletionResponse {
  completed: boolean;
  votedCount: number;
  total: number;
}

export interface PlayerArchetypeResponse {
  archetype: string;
  label: string;
  description: string;
}

const TOTAL_QUESTIONS = 15;

const MOCK_ARCHETYPES: PlayerArchetypeResponse[] = [
  { archetype: 'collector', label: 'Le Collectionneur', description: 'Stub description — logique réelle côté worker.' },
  { archetype: 'strategist', label: 'Le Stratège', description: 'Stub description — logique réelle côté worker.' },
  { archetype: 'socializer', label: 'Le Sociable', description: 'Stub description — logique réelle côté worker.' },
  { archetype: 'competitor', label: 'Le Compétiteur', description: 'Stub description — logique réelle côté worker.' },
  { archetype: 'explorer', label: 'L’Explorateur', description: 'Stub description — logique réelle côté worker.' },
  { archetype: 'creator', label: 'Le Créateur', description: 'Stub description — logique réelle côté worker.' },
  { archetype: 'grinder', label: 'Le Bosseur', description: 'Stub description — logique réelle côté worker.' },
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

const isMockEnabled = (): boolean => import.meta.env.VITE_USE_MOCK_PREFERENCES_API === 'true';
const isForcedCompleted = (): boolean => import.meta.env.VITE_MOCK_PREFS_FORCE_COMPLETED === 'true';

function workerUrl(path: string): string {
  const base = import.meta.env.VITE_WORKER_URL ?? '';
  return `${base}${path}`;
}

export async function fetchArchetypeCompletion(address: string): Promise<ArchetypeCompletionResponse> {
  if (isMockEnabled()) {
    await delay(300);
    return isForcedCompleted()
      ? { completed: true, votedCount: TOTAL_QUESTIONS, total: TOTAL_QUESTIONS }
      : { completed: false, votedCount: 0, total: TOTAL_QUESTIONS };
  }

  const response = await fetch(workerUrl(`/api/player/${address}/preferences/completion`));
  if (!response.ok) {
    throw new Error(`Failed to fetch preferences completion: ${response.status}`);
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
