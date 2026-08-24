import { workerUrl } from '../../../../lib/workerClient';

export interface PreferencesCompletionResponse {
  completed: boolean;
  answeredCount: number;
  total: number;
  missingQuestionIds: string[];
  selectedTripleIds: string[];
}

export async function fetchPreferencesCompletion(address: string): Promise<PreferencesCompletionResponse> {
  const response = await fetch(workerUrl(`/api/player/${address}/preferences/completion`));
  if (!response.ok) {
    throw new Error(`Failed to fetch preferences completion: ${response.status}`);
  }
  return response.json();
}
