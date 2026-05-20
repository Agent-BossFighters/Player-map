import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Network, API_URLS } from './useAtomData';
import { useBatchCreateTriple } from './useBatchCreateTriple';
import { useRedeemBatch } from './useRedeemBatch';
import { ATOM_CONTRACT_ADDRESS, atomABI } from '../abi';
import { PREDICATES, ATOMS } from '../utils/constants';
import { apiCache } from '../utils/apiCache';

export type FollowState = 'idle' | 'loading' | 'not-following' | 'following';

interface UseFollowPlayerProps {
  walletConnected?: any;
  walletAddress?: string;
  publicClient?: any;
  myAccountAtomId: string | null;
  otherAccountAtomId: string | null;
  network?: Network;
}

interface UseFollowPlayerResult {
  followState: FollowState;
  tripleId: string | null;
  userShares: bigint;
  txLoading: boolean;
  error: string | null;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
}

// Triple structure: (I, follow, otherAccountAtomId)
// The "I" atom is the universal subject — the player signals follow by depositing into this triple's vault.

export const useFollowPlayer = ({
  walletConnected,
  walletAddress,
  publicClient,
  myAccountAtomId,
  otherAccountAtomId,
  network = Network.MAINNET,
}: UseFollowPlayerProps): UseFollowPlayerResult => {
  const [followState, setFollowState] = useState<FollowState>('idle');
  const [tripleId, setTripleId] = useState<string | null>(null);
  const [userShares, setUserShares] = useState<bigint>(0n);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { batchCreateTriple } = useBatchCreateTriple({ walletConnected, walletAddress, publicClient });
  const { redeemBatch } = useRedeemBatch({ walletConnected, walletAddress });

  // Triple is (I, follow, otherAccountAtomId).
  // Check if it exists, and if so whether the current wallet has shares > 0 in its vault.
  const checkFollowState = useCallback(async () => {
    if (!myAccountAtomId || !otherAccountAtomId || !walletAddress) {
      setFollowState('idle');
      return;
    }
    setFollowState('loading');
    try {
      const apiUrl = API_URLS[network];
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query CheckFollow($iAtom: String!, $predicate: String!, $object: String!, $wallet: String!) {
              triples(where: {
                subject_id: { _eq: $iAtom },
                predicate_id: { _eq: $predicate },
                object_id: { _eq: $object }
              }, limit: 1) {
                term_id
                term {
                  positions(where: { account_id: { _ilike: $wallet }, shares: { _gt: "0" } }) {
                    shares
                    account_id
                  }
                }
              }
            }
          `,
          variables: {
            iAtom: ATOMS.I,
            predicate: PREDICATES.FOLLOWS,
            object: otherAccountAtomId,
            wallet: walletAddress.toLowerCase(),
          },
        }),
      });

      const data = await response.json();
      const triples = data.data?.triples || [];

      if (triples.length === 0) {
        setTripleId(null);
        setUserShares(0n);
        setFollowState('not-following');
      } else {
        const triple = triples[0];
        setTripleId(triple.term_id);
        const positions = triple.term?.positions || [];
        if (positions.length > 0) {
          setUserShares(BigInt(positions[0].shares));
          setFollowState('following');
        } else {
          setUserShares(0n);
          setFollowState('not-following');
        }
      }
    } catch (err) {
      console.error('[useFollowPlayer] checkFollowState error:', err);
      setFollowState('not-following');
    }
  }, [myAccountAtomId, otherAccountAtomId, walletAddress, network]);

  useEffect(() => { checkFollowState(); }, [checkFollowState]);

  // Retry refetching follow count until it reflects the expected change or max retries reached
  const refetchFollowCountUntilChanged = useCallback((expectedDelta: 1 | -1) => {
    const delays = [2000, 3000, 5000, 8000];
    const prevEntries = queryClient.getQueriesData<any>({ queryKey: ['otherPlayerFollowCounts', otherAccountAtomId] });
    const prevCount: number = prevEntries[0]?.[1]?.followersCount ?? -1;

    const attempt = async (index: number) => {
      if (index >= delays.length) return;
      await new Promise(r => setTimeout(r, delays[index]));
      await queryClient.refetchQueries({ queryKey: ['otherPlayerFollowCounts', otherAccountAtomId] });
      const newEntries = queryClient.getQueriesData<any>({ queryKey: ['otherPlayerFollowCounts', otherAccountAtomId] });
      const newCount: number = newEntries[0]?.[1]?.followersCount ?? prevCount;
      const changed = expectedDelta > 0 ? newCount > prevCount : newCount < prevCount;
      if (!changed) attempt(index + 1);
    };
    attempt(0);
  }, [queryClient, otherAccountAtomId]);

  const follow = async () => {
    if (!otherAccountAtomId || !walletAddress || !walletConnected) return;

    // Optimistic: button state only
    const prevFollowState = followState;
    setFollowState('following');

    setTxLoading(true);
    setError(null);
    try {
      if (!tripleId) {
        await batchCreateTriple([{
          subjectId: BigInt(ATOMS.I),
          predicateId: BigInt(PREDICATES.FOLLOWS),
          objectId: BigInt(otherAccountAtomId),
        }]);
      } else {
        const depositAmount = BigInt(import.meta.env.VITE_VALUE_PER_TRIPLE || '10000000000000000');
        await walletConnected.writeContract({
          address: ATOM_CONTRACT_ADDRESS,
          abi: atomABI,
          functionName: 'depositBatch',
          args: [
            walletAddress as `0x${string}`,
            [tripleId as `0x${string}`],
            [1n],
            [depositAmount],
            [0n],
          ],
          value: depositAmount,
          gas: 500000n,
        });
      }
      setUserShares(1n);
      apiCache.clear();
      await queryClient.invalidateQueries({ queryKey: ['positions'] });
      await queryClient.invalidateQueries({ queryKey: ['followsAndFollowers'] });
      refetchFollowCountUntilChanged(1);
    } catch (err: any) {
      setFollowState(prevFollowState);
      console.error('[useFollowPlayer] follow error:', err);
      const msg = (err?.message ?? err?.shortMessage ?? String(err)).toLowerCase();
      const isRejected = err?.name === 'UserRejectedRequestError' || msg.includes('user rejected');
      const isInsufficient = msg.includes('insufficient funds') || msg.includes('exceeds the balance');
      if (isRejected) setError('Transaction cancelled.');
      else if (isInsufficient) setError('Insufficient TRUST. First follow requires ~0.11 TRUST, subsequent follows 0.01 TRUST.');
      else setError(err?.shortMessage ?? err?.message ?? String(err));
    } finally {
      setTxLoading(false);
    }
  };

  const unfollow = async () => {
    if (!tripleId || !walletAddress || !walletConnected || followState !== 'following') return;

    // Always read actual shares from chain — userShares may be stale or placeholder
    let sharesToRedeem = userShares;
    if (publicClient) {
      try {
        sharesToRedeem = await publicClient.readContract({
          address: ATOM_CONTRACT_ADDRESS as `0x${string}`,
          abi: atomABI,
          functionName: 'getShares',
          args: [walletAddress as `0x${string}`, tripleId as `0x${string}`, 1n],
        }) as bigint;
      } catch { /* fallback to stored userShares */ }
    }
    if (sharesToRedeem === 0n) return;

    // Optimistic: button state only
    const prevFollowState = followState;
    setFollowState('not-following');

    setTxLoading(true);
    setError(null);
    try {
      await redeemBatch({
        receiver: walletAddress as `0x${string}`,
        termIds: [tripleId as `0x${string}`],
        curveIds: [1n],
        shares: [sharesToRedeem],
        minAssets: [0n],
      });
      setUserShares(0n);
      apiCache.clear();
      await queryClient.invalidateQueries({ queryKey: ['positions'] });
      await queryClient.invalidateQueries({ queryKey: ['followsAndFollowers'] });
      refetchFollowCountUntilChanged(-1);
    } catch (err: any) {
      setFollowState(prevFollowState);
      console.error('[useFollowPlayer] unfollow error:', err);
      const msg = (err?.message ?? err?.shortMessage ?? String(err)).toLowerCase();
      const isRejected = err?.name === 'UserRejectedRequestError' || msg.includes('user rejected');
      if (isRejected) setError('Transaction cancelled.');
      else setError(err?.shortMessage ?? err?.message ?? String(err));
    } finally {
      setTxLoading(false);
    }
  };

  return { followState, tripleId, userShares, txLoading, error, follow, unfollow };
};
