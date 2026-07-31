import { Quest } from '../_types';
import { fetchArchetypeCompletion } from './hooks/archetypeApi';

export const archetypeQuest: Quest = {
  id: 'preferences',
  title: 'Préférences joueur',
  description: 'Réponds à quelques questions sur ta façon de jouer.',
  category: 'onboarding',
  checkStatus: async (address: string) => {
    const completion = await fetchArchetypeCompletion(address);
    return {
      status: completion.completed
        ? 'completed'
        : completion.votedCount > 0
          ? 'in_progress'
          : 'available',
      progress: completion.total > 0 ? completion.votedCount / completion.total : 0,
    } as const;
  },
};
