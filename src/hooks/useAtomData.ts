import { createServerClient } from '@0xintuition/graphql';

// Enum pour les différents réseaux disponibles
export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet'
}

// URLs des API GraphQL
export const API_URLS = {
  [Network.MAINNET]: 'https://prod.base.intuition-api.com/v1/graphql',
  [Network.TESTNET]: 'https://dev.base-sepolia.intuition-api.com/v1/graphql' // TODO: change to mainnet
};

// Fonction pour créer un client avec le réseau approprié
export const createClient = (network: Network = Network.MAINNET): ReturnType<typeof createServerClient> => {
  const options = {
    url: API_URLS[network],
    headers: {
      'Content-Type': 'application/json',
      // Add an API key header if available
      // 'x-api-key': process.env.INTUITION_API_KEY || ''
    },
    token: undefined // Assuming token is optional and can be undefined
  };
  return createServerClient(options);
}; 