// CONFIDENTIALITÉ MÉTHODOLOGIE : ce fichier ne contient QUE texte de question,
// tripleIds et groupement en steps. Aucun champ axis/weight/type: anchor|support —
// le mapping tripleId → axe/archétype et les formules de scoring vivent côté worker uniquement.

export type AnswerCurve = 'for' | 'against';
export type AnswerIntensity = 'faible' | 'fort';

export interface IntensityForAgainstQuestion {
  type: 'intensity_for_against';
  id: string;
  question: string;
  tripleId: string;
}

export interface MultiRatingOption {
  tripleId: string;
  label: string;
}

// Conservé pour de futurs questionnaires — inutilisé par la config "Préférences"
// v2 (15 questions xlsx, chacune son propre prédicat/objet, pas de regroupement).
export interface MultiRatingQuestion {
  type: 'multi_rating';
  id: string;
  question: string;
  options: MultiRatingOption[];
}

export type ArchetypeQuestion = IntensityForAgainstQuestion | MultiRatingQuestion;

export interface ArchetypeStep {
  id: string;
  title?: string;
  questions: ArchetypeQuestion[];
}

// Une step à N > 1 questions doit être homogène en type (soit toutes
// intensity_for_against, soit toutes multi_rating). Une step à 1 question
// peut être n'importe quel type. Validé au chargement du module.
function assertHomogeneousStep(step: ArchetypeStep): void {
  if (step.questions.length <= 1) return;
  const types = new Set(step.questions.map(q => q.type));
  if (types.size > 1) {
    throw new Error(
      `[archetype-questionnaire.config] Step "${step.id}" mixes question types (${[...types].join(', ')}) — ` +
      `a step with more than one question must be homogeneous.`
    );
  }
}

// 15 questions individuelles (xlsx v2) — chacune son propre triple, une step
// par question. Ordre = ordre du xlsx (Q1..Q15) ; l'affichage réel est mélangé
// par la randomisation de steps existante (seed stable dans le draft).
export const ARCHETYPE_STEPS: ArchetypeStep[] = [
  {
    id: 'pref_q1',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q1',
        question: "J'aime obtenir des objets, skins ou récompenses disponibles.",
        tripleId: 'TRIPLE_ID_TO_FILL_Q1',
      },
    ],
  },
  {
    id: 'pref_q2',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q2',
        question: 'Compléter une collection me procure beaucoup de satisfaction.',
        tripleId: 'TRIPLE_ID_TO_FILL_Q2',
      },
    ],
  },
  {
    id: 'pref_q3',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q3',
        question: 'Je passe du temps à rechercher des objets rares.',
        tripleId: 'TRIPLE_ID_TO_FILL_Q3',
      },
    ],
  },
  {
    id: 'pref_q4',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q4',
        question: "J'aime posséder des objets que peu d'autres joueurs ont.",
        tripleId: 'TRIPLE_ID_TO_FILL_Q4',
      },
    ],
  },
  {
    id: 'pref_q5',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q5',
        question: 'Les succès et trophées sont importants pour moi.',
        tripleId: 'TRIPLE_ID_TO_FILL_Q5',
      },
    ],
  },
  {
    id: 'pref_q6',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q6',
        question: 'Mon objectif principal est de devenir meilleur que les autres joueurs.',
        tripleId: 'TRIPLE_ID_TO_FILL_Q6',
      },
    ],
  },
  {
    id: 'pref_q7',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q7',
        question: "Les classements et rangs m'intéressent beaucoup.",
        tripleId: 'TRIPLE_ID_TO_FILL_Q7',
      },
    ],
  },
  {
    id: 'pref_q8',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q8',
        question: "Je regarde mes performances pour m'améliorer.",
        tripleId: 'TRIPLE_ID_TO_FILL_Q8',
      },
    ],
  },
  {
    id: 'pref_q9',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q9',
        question: 'La victoire est plus importante que les récompenses obtenues.',
        tripleId: 'TRIPLE_ID_TO_FILL_Q9',
      },
    ],
  },
  {
    id: 'pref_q10',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q10',
        question: "J'apprécie les défis difficiles qui testent mes compétences.",
        tripleId: 'TRIPLE_ID_TO_FILL_Q10',
      },
    ],
  },
  {
    id: 'pref_q11',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q11',
        question: 'Je joue principalement pour me détendre.',
        tripleId: 'TRIPLE_ID_TO_FILL_Q11',
      },
    ],
  },
  {
    id: 'pref_q12',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q12',
        question: "J'aime recevoir des récompenses régulières pour mon temps de jeu.",
        tripleId: 'TRIPLE_ID_TO_FILL_Q12',
      },
    ],
  },
  {
    id: 'pref_q13',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q13',
        question: 'Je préfère les objectifs simples et accessibles.',
        tripleId: 'TRIPLE_ID_TO_FILL_Q13',
      },
    ],
  },
  {
    id: 'pref_q14',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q14',
        question: "J'aime jouer sans pression compétitive.",
        tripleId: 'TRIPLE_ID_TO_FILL_Q14',
      },
    ],
  },
  {
    id: 'pref_q15',
    questions: [
      {
        type: 'intensity_for_against',
        id: 'pref_q15',
        question: 'Les bonus quotidiens ou événements me motivent à revenir.',
        tripleId: 'TRIPLE_ID_TO_FILL_Q15',
      },
    ],
  },
];

ARCHETYPE_STEPS.forEach(assertHomogeneousStep);

export const TOTAL_ARCHETYPE_TRIPLE_COUNT = ARCHETYPE_STEPS.reduce((sum, step) => {
  return sum + step.questions.reduce(
    (s, q) => s + (q.type === 'multi_rating' ? q.options.length : 1),
    0
  );
}, 0);
