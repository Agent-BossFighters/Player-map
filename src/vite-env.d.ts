/// <reference types="vite/client" />

/**
 * Note importante:
 * Les variables d'environnement ne sont plus utilisées directement.
 * La bibliothèque nécessite une initialisation explicite via PlayerMapConfig.init()
 */
interface ImportMetaEnv {
  VITE_INTUITION_GRAPHQL_URL: string;
  // Ces variables NE sont PAS utilisées directement dans la bibliothèque,
  // elles peuvent servir à configurer l'application qui utilise la bibliothèque
  readonly VITE_API_URL?: string;

  // Variables utilisées par d'autres parties de l'application
  readonly VITE_ATOM_CONTRACT_ADDRESS: string;
  readonly VITE_VALUE_PER_ATOM: string;
  readonly VITE_VALUE_PER_TRIPLE: string;
  readonly VITE_ATOM_CONTRACT_CHAIN_ID: string;

  // Quête "Préférences joueur" — worker player-facing pas encore en place,
  // mode mock activable en attendant (voir missions/global/archetype/hooks/archetypeApi.ts)
  readonly VITE_WORKER_URL?: string;
  readonly VITE_USE_MOCK_PREFERENCES_API?: string;
  readonly VITE_MOCK_PREFS_FORCE_COMPLETED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  export default ReactComponent;
} 