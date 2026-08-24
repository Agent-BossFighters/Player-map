// CONFIDENTIALITÉ MÉTHODOLOGIE : ce fichier ne contient QUE texte de question,
// tripleIds et libellés d'options. Aucune formule de scoring ici.

import { MultiSelectOption, MultiSelectQuestion } from '../archetype/archetype-questionnaire.config';

export interface PreferenceQuestionConfig {
  id: string;
  question: string;
  options: MultiSelectOption[];
  singleSelect?: boolean;
}

// 7 questions à choix multiple (checkboxes). Chaque option = un triple déjà
// créé on-chain ([Player] - <predicate de la question> - <objet>).
//
// 3 options d'"enjoysType" (Lan, Cross platform, Share/Split Screen) n'ont pas
// encore de tripleId — omises pour l'instant, à ajouter dès qu'elles existent.
export const PREFERENCE_QUESTIONS: PreferenceQuestionConfig[] = [
  {
    id: 'enjoysGenre',
    question: 'What game genres do you enjoy?',
    options: [
      { tripleId: '0x4b91231f5aa722eb0d5d1e9913e15f9f06ac223bbcd8f10b2e94232a322a6d25', label: 'Action' },
      { tripleId: '0x59b3f6ae500f6179eae5be01ba3ead6414c83924b6bc87f49ff046cd2a201967', label: 'Adventure' },
      { tripleId: '0xfe1f8b39597e74dda1baf40a909c05c688c7e46490eb1870a372eb0629311f0a', label: 'Battle Royale' },
      { tripleId: '0xc7f10f5a53419147a5d77d5458ff71082bfffc30fe03586accdf02ce8942631d', label: "Beat 'em up" },
      { tripleId: '0x27bdc76873e6a6a06648ab23f8b97f6ce271856313a30b3ef621051d033d80c2', label: 'Card Game' },
      { tripleId: '0x806f46ad03ce1d294466a0e0f5b46e47976918d9924f5ef6fe9dec0daf56d6cf', label: 'Deckbuilding' },
      { tripleId: '0x449ed28102a768b0b36f64000c7c14e1868d39880e6af2ad89130003bd285058', label: 'Extraction' },
      { tripleId: '0x7d8d7a4d9cdfab2a6d91772df2e57f02ad2fce7b22d1fad6e0a1963f1f1cdc4a', label: 'FPS' },
      { tripleId: '0xc384b2bfa180f69064677a7386f7cf51fc77c7ded53a16e397833188ecf22793', label: 'Fighting' },
      { tripleId: '0xe6efe28265d19e843906e4aa88e77a0471de42cbc6de70919dcf6ca2d7b9c396', label: 'Hack and Slash' },
      { tripleId: '0xe5c3f5de0384217f2b6d22750cf77d445ff6dfc1b203fd6976c0a4ba2713f81c', label: 'Horror' },
      { tripleId: '0x2abf928c77475a88c9531455e65f500dddc4eab80ca6489757179df95f52ca6e', label: 'MMORPG' },
      { tripleId: '0x5cf3db552f9810f57b66c1f346f509e0dff81abd4a0b0fe9ec7c7ce6850d0166', label: 'MOBA' },
      { tripleId: '0xd16e822b9d992616d1bff134764b8acb43b0ca5c4829cd01816c83ec274120d1', label: 'Puzzle' },
      { tripleId: '0x4389d4b359f902e1c58ffcb4b9e9f7c8ecaa8d08c90e92532a7fa2c54e7e62f2', label: 'Roguelike' },
      { tripleId: '0x0ca9cc033252a785b7ac661485aa8ac3a61b3e6bedbd006ab48636edd3c02eed', label: 'RPG' },
      { tripleId: '0xd27065552ee388b6eca2bf0942b0360b7a35eaa8d4838c751dd018fddb3d0f10', label: 'RTS' },
      { tripleId: '0x3c41222c4d95a7a99dfcbc01812e924e73b7d81c39cf44c94abe60e5b106148a', label: 'Sandbox' },
      { tripleId: '0xf0ff6d30314f4b412ce502b9edd2bc802dcb7b87f9c62c43b8bc807428a61685', label: 'Shooter' },
      { tripleId: '0xb251ac8f0575646267a947f0cc6a13b93f590a3c172117d05c2a689e4d6a5f76', label: 'Souls-like' },
      { tripleId: '0xd26cceed31bdc7c31ba0a8a2f8c2f33197a81cf77d6ad3ad93a377e3ae93337b', label: 'Sports' },
      { tripleId: '0xd7df8e00c4d18845c4489f61c7f51a75c9ed621fbb5218b4843f8c9c04164300', label: 'Simulation' },
      { tripleId: '0xd9653046a491e9e62c2256cea16682dbfaf0369959ebe469b9d9ecd8bfb0fbda', label: 'Strategy' },
      { tripleId: '0xeb4bc3f82b5a24214ca2a8cb3fae359f94b9e260f77fb31414893ee039dc514e', label: 'Survival' },
      { tripleId: '0xbeebb9bbef474c5714d57dcef453c15995d4074eb3d4a983086d7df5107af45f', label: 'Tactical' },
    ],
  },
  {
    id: 'prefersPlayStyle',
    question: 'What play styles describe you?',
    options: [
      { tripleId: '0x51378929d22c371352ba673ac0f3cdbb931d182caacc80276f692f9a887ced91', label: 'Casual' },
      { tripleId: '0x38d3dc23eea2adc926e6481524e1561f4d2a442de4c577ec1235b1436aecab6a', label: 'Competitive' },
      { tripleId: '0xf67d9888cdddd65742d80e27cfb69ef14671025e3d0f6f71daa0f35c13f14eb5', label: 'Completionist' },
      { tripleId: '0x2758846bbd3b260b44009e12fa868cf2e599782cb7ff6c3a835dba52e6c81d70', label: 'Explorer' },
      { tripleId: '0x08a962dd0f8b0d68c2ebb4f29c5026f97b1de154a954ae137275341f52153fd5', label: 'Social' },
      { tripleId: '0x2745f6039e6679c6f07f22a78337d6c840815661bf2c85b720bd91cce5c26181', label: 'Speedrunner' },
    ],
  },
  {
    id: 'weeklyPlay',
    question: 'How often do you play?',
    singleSelect: true,
    options: [
      { tripleId: '0x18b0069d5f047276b36298917f313d8e1ee44b204145ee88feafdcf81f02a5d8', label: 'Daily', description: '5+ days a week' },
      { tripleId: '0xa86707d331862a691bdd2d8cba845b1551d48594943d7fe9dc2e035ab1571ec4', label: 'Several times a week', description: '3-4 days a week' },
      { tripleId: '0x906b7f10112ecf9af220431418726292a34324bca58fe92b1fce153a752a496f', label: 'Weekly', description: '1-2 days a week' },
      { tripleId: '0xea742e14a2d4119a1cf0707df47420785c2842e89d06ef087de7317734341b44', label: 'Occasionally', description: 'Less than once a week' },
    ],
  },
  {
    id: 'valuesInGame',
    question: 'What type of in-game assets do you value most?',
    options: [
      { tripleId: '0xb7a0d4b552ce9d0dbce62fa8d09ae29f9aab4ed8624f2a05b3818a9b76d03a77', label: 'Power assets' },
      { tripleId: '0x6b1b966c265eea0e4a70b1abe492cde84c442f0c6ff9579e0b85597b8f93e594', label: 'Cosmetic assets' },
      { tripleId: '0x3f24e27b2718822fb0484ef03c3ec5504768b4426908cac8fbb2ca1d88408858', label: 'Collection assets' },
      { tripleId: '0xd082fce5656e6b9664a887a05b92927a74528140d078162ba9588dca8e00eba0', label: 'Status assets' },
      { tripleId: '0x526ceda62f9ba4003b506f7b179d51ecb7784dd39db2adafa3fab963f5e8dec5', label: 'Currency assets' },
    ],
  },
  {
    id: 'enjoysType',
    question: 'What types of gaming experiences do you enjoy?',
    options: [
      { tripleId: '0x6418e3a08770e7cd9eaa8c392dbea0a4bc29b46f3657815b0ca537a02dae72d0', label: 'Single player' },
      { tripleId: '0xd5ca21a03c2927b29d6885b8fafba51ba9fbf02cb997e2fb5b2705151b90a165', label: 'Co-op' },
      { tripleId: '0xcd07ee79f499886f2a4d573773b888c8f3cb2e1a2cd9f95a069b908aba2119a5', label: 'Multi player' },
      { tripleId: '0x7b49a00be719f5cad03f021f0142ab6aacb20afce2ed366d82cc46448b92c817', label: 'Online' },
      // Lan, Cross platform, Share/Split Screen — pas encore de tripleId.
    ],
  },
  {
    id: 'prefersGameMode',
    question: 'What game modes do you prefer?',
    options: [
      { tripleId: '0x213c7ecea557a1e90d99f597b951ea9b7fd49b5226dff7ef8e83824ef97d003b', label: 'PvP' },
      { tripleId: '0x6e2fce8f7c1332b30ba8b27da8098a83106689eb7a0d1e8fb7e1c7e96f4fa12f', label: 'PvE' },
      { tripleId: '0x8b70df97a49b0273f95da24c83925807d44b0cc7a13e985c3e394ca83406b2f1', label: 'PvPvE' },
    ],
  },
  {
    id: 'prefersMonetization',
    question: 'What monetization models do you prefer?',
    options: [
      { tripleId: '0xc2bb3ff8635084da2065f0339e4b0c3ca4a9547e59aec400f009d8f9e378fd89', label: 'Free to play' },
      { tripleId: '0x6f806c2046c6a33fd815a88c12cd95fea3b93d85e2a1682d5fac791ca9a11a32', label: 'Premium' },
      { tripleId: '0x135f11313eef6e37a79d05e7d506524a2b386dab5906080bc429cd5aba0a363d', label: 'Play to earn' },
      { tripleId: '0x882095b53ad79a3c68a6917528db9a8260bd52259ddadeba1ddcbb1142bc02d6', label: 'Play and earn' },
      { tripleId: '0x07b3cd826453149a5c87089ba2bee79778741a430d2c21da81406db6a422ae1e', label: 'CosmeticOnly' },
    ],
  },
];

export const PREFERENCE_STEPS: MultiSelectQuestion[] = PREFERENCE_QUESTIONS.map(q => ({
  type: 'multi_select' as const,
  id: q.id,
  question: q.question,
  options: q.options,
}));

export const TOTAL_PREFERENCE_QUESTION_COUNT = PREFERENCE_QUESTIONS.length;
