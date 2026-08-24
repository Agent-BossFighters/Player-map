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

export interface MultiSelectOption {
  tripleId: string;
  label: string;
  description?: string;
}

// Utilisé par le questionnaire "Player Preferences" (player-preferences-
// questionnaire.config.ts) — cases à cocher, N options sélectionnables
// indépendamment, pas d'intensité/direction (contrairement aux deux types
// ci-dessus). Réponse = ensemble de tripleIds cochés, pas un AnswerValue.
export interface MultiSelectQuestion {
  type: 'multi_select';
  id: string;
  question: string;
  options: MultiSelectOption[];
}

export type ArchetypeQuestion = IntensityForAgainstQuestion | MultiRatingQuestion | MultiSelectQuestion;

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
        tripleId: '0xe913b6591957562e0f7387cc3d6f92f46b3487b75bfe5b463d80957bcf8d4262',
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
        tripleId: '0x23e43b32eeb652392ef148bbc4c4f8ab5f820f1ce78ab20de9d04cb926efb0b5',
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
        tripleId: '0x47f7cf34c6df94c39cb834cf6afc499a57c040821da3466f4e10b5ae8de84345',
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
        tripleId: '0x19c157d8d874b5262a69ac56f3f219428f73d370c66a6b8aae231e6b48b57b12',
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
        tripleId: '0xe9ec46fe7df1bf0ab67006e10251b92e05ecc595e990177286c7f31652cd365e',
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
        tripleId: '0x12ee5e28245f200fa46d197e23731de226f616fb7ad268944aab7e98d3145ba7',
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
        tripleId: '0x662b1f8402992fa3e555c6ec4a6e28725e3449fe3b74655e98f62a504f2e11e5',
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
        tripleId: '0x068d361790babdb491c58d67abd82057f42df9d754f4f86867f8afa97cb1f368',
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
        tripleId: '0xb7fcf5c6f5cb9e132cb71a0350f27ed99c38d23d0bdc08a68650ae739f0a563c',
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
        tripleId: '0x2e68353234931d9d1ebe276756140ad0ebd31e3a256a40e6bc45f80a5327f633',
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
        tripleId: '0x3e1c1336ad5b57d8990f3818f94c4f283ae2f1ae8a2eca9ef3ba1a22b563ece9',
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
        tripleId: '0x888d5ea0f1d9d013dc3d0dea2bf031afe9ac654b1fd553294f7ebaf63dc5e54c',
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
        tripleId: '0xe55a9cc22d40756f2f14bcaf8cd0f9e0534bf1377b0d621baf1a8ea744d21518',
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
        tripleId: '0xcb93e34854887cf14f1757abc047d5b63cd8a948ab86550af2f9ccfd8594e0de',
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
        tripleId: '0x93d5800e8d6d0fc906efb073f3b49ec48daa052ed45911c8b8ba69ac6cf2fe5c',
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
