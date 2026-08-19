import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { ATOM_CONTRACT_ADDRESS, atomABI } from '../../../../abi';
import { Network, API_URLS } from '../../../../hooks/useAtomData';
import { ARCHETYPE_STEPS } from '../archetype-questionnaire.config';
import { AnswerValue, MultiRatingAnswer, ArchetypeAnswers } from './useArchetypeDraft';

interface UseArchetypeSubmissionProps {
  walletConnected?: any;
  walletAddress?: string;
  network?: Network;
}

interface PendingDeposit {
  tripleId: string;
  curve: 'for' | 'against';
  amount: bigint;
}

// Mapping intensité → montant (parseEther, jamais de float direct).
// intensity_for_against : symétrique for/against. multi_rating for : deux
// niveaux. multi_rating against : un seul niveau (faible).
// fort = 0.03 (intensité 3 côté worker, intensityMax 3) — l'écart 1 vs 3
// entre agree et strongly agree est ce qui permet à un axe de se démarquer ;
// avec l'ancien 0.02 (intensité 2), "agree partout" atteignait déjà 50% du
// max sur chaque axe et le classement retombait systématiquement sur
// versatile.
const AMOUNT_FAIBLE = parseEther('0.01');
const AMOUNT_FORT = parseEther('0.03');

function isMultiRatingAnswer(value: AnswerValue | MultiRatingAnswer): value is MultiRatingAnswer {
  return !('curve' in value);
}

function amountForIntensity(value: AnswerValue): bigint {
  return value.intensity === 'fort' ? AMOUNT_FORT : AMOUNT_FAIBLE;
}

function amountForMultiRatingOption(value: AnswerValue): bigint {
  if (value.curve === 'against') return AMOUNT_FAIBLE; // un seul niveau côté against
  return amountForIntensity(value);
}

function buildPendingDeposits(answers: ArchetypeAnswers): PendingDeposit[] {
  const deposits: PendingDeposit[] = [];

  for (const step of ARCHETYPE_STEPS) {
    for (const question of step.questions) {
      const answer = answers[question.id];
      if (!answer) continue;

      if (question.type === 'intensity_for_against') {
        if (isMultiRatingAnswer(answer)) continue;
        deposits.push({
          tripleId: question.tripleId,
          curve: answer.curve,
          amount: amountForIntensity(answer),
        });
      } else {
        if (!isMultiRatingAnswer(answer)) continue;
        for (const option of question.options) {
          const value = answer[option.tripleId];
          if (!value) continue;
          deposits.push({
            tripleId: option.tripleId,
            curve: value.curve,
            amount: amountForMultiRatingOption(value),
          });
        }
      }
    }
  }

  return deposits;
}

// Résout term_id/counter_term_id d'un triple — même requête que useDepositTriple.ts.
async function fetchTripleTermIds(
  tripleId: string,
  network: Network
): Promise<{ term_id: string; counter_term_id: string } | null> {
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
              counter_term_id
            }
          }
        `,
        variables: { tripleId: String(tripleId) },
      }),
    });

    if (!response.ok) return null;
    const result = await response.json();
    if (result.errors || !result.data?.triple) return null;
    return result.data.triple;
  } catch {
    return null;
  }
}

export function useArchetypeSubmission({
  walletConnected,
  walletAddress,
  network = Network.MAINNET,
}: UseArchetypeSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const submit = async (answers: ArchetypeAnswers): Promise<boolean> => {
    if (!walletConnected || !walletAddress) {
      setError('Wallet non connecté.');
      return false;
    }

    const pending = buildPendingDeposits(answers);
    if (pending.length === 0) {
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

      for (const deposit of pending) {
        const triple = await fetchTripleTermIds(deposit.tripleId, network);
        if (!triple) {
          throw new Error(`Impossible de résoudre le triple ${deposit.tripleId}`);
        }
        const targetId = deposit.curve === 'for' ? triple.term_id : triple.counter_term_id;
        if (!targetId) {
          throw new Error(`Vault ${deposit.curve} introuvable pour le triple ${deposit.tripleId}`);
        }
        termIds.push(targetId as `0x${string}`);
        curveIds.push(1n);
        assets.push(deposit.amount);
        minShares.push(0n);
      }

      // Un seul appel depositBatch — les dépôts accumulés dans le draft partent
      // en une seule transaction, comme useDepositTriple.ts.
      const hash = await walletConnected.writeContract({
        address: ATOM_CONTRACT_ADDRESS,
        abi: atomABI,
        functionName: 'depositBatch',
        args: [walletAddress, termIds, curveIds, assets, minShares],
        value: assets.reduce((sum, a) => sum + a, 0n),
        gas: 500000n * BigInt(pending.length),
      });

      if (walletConnected.waitForTransactionReceipt) {
        await walletConnected.waitForTransactionReceipt({ hash });
      }

      setTxHash(typeof hash === 'string' ? hash : (hash as { hash: string }).hash);

      await queryClient.invalidateQueries({ queryKey: ['archetypeCompletion', walletAddress] });
      await queryClient.invalidateQueries({ queryKey: ['playerArchetype', walletAddress] });
      await queryClient.invalidateQueries({ queryKey: ['questStatus', 'archetype', walletAddress] });
      // Drives the CLAIM button on the mission card itself — without this the
      // missions list (30s staleTime, never otherwise invalidated by this
      // flow) keeps showing the pre-submit in_progress state until something
      // else happens to refetch it (e.g. a full page reload).
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
