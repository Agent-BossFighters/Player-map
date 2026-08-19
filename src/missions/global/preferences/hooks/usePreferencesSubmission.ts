import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { ATOM_CONTRACT_ADDRESS, atomABI } from '../../../../abi';
import { Network, API_URLS } from '../../../../hooks/useAtomData';
import { PreferencesAnswers } from './usePreferencesDraft';

interface UsePreferencesSubmissionProps {
  walletConnected?: any;
  walletAddress?: string;
  network?: Network;
}

// A checkbox is a plain "selected" signal, no intensity — same fixed amount
// as archetype's low ("faible") tier.
const SELECTION_AMOUNT = parseEther('0.01');

function buildPendingTripleIds(answers: PreferencesAnswers): string[] {
  const tripleIds: string[] = [];
  for (const selected of Object.values(answers)) {
    tripleIds.push(...selected);
  }
  return tripleIds;
}

// Resolves term_id for a triple's "for" vault — same query shape as
// useArchetypeSubmission.ts's fetchTripleTermIds, trimmed to the one side
// preferences ever deposits against.
async function fetchTripleTermId(tripleId: string, network: Network): Promise<string | null> {
  try {
    const apiUrl = API_URLS[network];
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query Triple($tripleId: String!) {
            triple(term_id: $tripleId) {
              term_id
            }
          }
        `,
        variables: { tripleId: String(tripleId) },
      }),
    });

    if (!response.ok) return null;
    const result = await response.json();
    if (result.errors || !result.data?.triple) return null;
    return result.data.triple.term_id;
  } catch {
    return null;
  }
}

export function usePreferencesSubmission({
  walletConnected,
  walletAddress,
  network = Network.MAINNET,
}: UsePreferencesSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const submit = async (answers: PreferencesAnswers): Promise<boolean> => {
    if (!walletConnected || !walletAddress) {
      setError('Wallet non connecté.');
      return false;
    }

    const pendingTripleIds = buildPendingTripleIds(answers);
    if (pendingTripleIds.length === 0) {
      setError('Aucune réponse à soumettre.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const termIds: `0x${string}`[] = [];
      const curveIds: bigint[] = [];
      const assets: bigint[] = [];
      const minShares: bigint[] = [];

      for (const tripleId of pendingTripleIds) {
        const termId = await fetchTripleTermId(tripleId, network);
        if (!termId) {
          throw new Error(`Impossible de résoudre le triple ${tripleId}`);
        }
        termIds.push(termId as `0x${string}`);
        curveIds.push(1n);
        assets.push(SELECTION_AMOUNT);
        minShares.push(0n);
      }

      const hash = await walletConnected.writeContract({
        address: ATOM_CONTRACT_ADDRESS,
        abi: atomABI,
        functionName: 'depositBatch',
        args: [walletAddress, termIds, curveIds, assets, minShares],
        value: assets.reduce((sum, a) => sum + a, 0n),
        gas: 500000n * BigInt(pendingTripleIds.length),
      });

      if (walletConnected.waitForTransactionReceipt) {
        await walletConnected.waitForTransactionReceipt({ hash });
      }

      setTxHash(typeof hash === 'string' ? hash : (hash as { hash: string }).hash);

      await queryClient.invalidateQueries({ queryKey: ['preferencesCompletion', walletAddress] });
      await queryClient.invalidateQueries({ queryKey: ['missions', walletAddress] });

      return true;
    } catch (err: any) {
      const msg = err?.shortMessage ?? err?.message ?? String(err);
      const isRejected =
        err?.name === 'UserRejectedRequestError' || msg.toLowerCase().includes('user rejected');
      setError(isRejected ? 'Transaction annulée.' : msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error, txHash };
}
