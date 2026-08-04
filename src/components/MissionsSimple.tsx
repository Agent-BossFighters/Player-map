import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaClock } from 'react-icons/fa';
import { useMissions } from '../missions/shared/useMissions';
import { useClaimMission } from '../missions/shared/useClaimMission';
import { ClaimError } from '../missions/shared/claimApi';
import MissionCard from '../missions/shared/MissionCard';
import type { Mission } from '../types/Missions';
import styles from './MissionsSimple.module.css';

const PANEL_STORAGE_KEY = 'playermap_missionsPanelOpen';

interface MissionsSimpleProps {
  walletAddress?: string;
  getAccessToken?: () => Promise<string | null>;
}

interface MissionBlockProps {
  title: string;
  colorVariant: 'daily' | 'global' | 'social';
  missions: Mission[];
  emptyLabel: string;
  onClaim: (mission: Mission) => void;
  pendingMissionId?: string;
  errorMissionId?: string;
  errorMessage?: string;
  errorIsRateLimit?: boolean;
}

const MissionBlock: React.FC<MissionBlockProps> = ({
  title,
  colorVariant,
  missions,
  emptyLabel,
  onClaim,
  pendingMissionId,
  errorMissionId,
  errorMessage,
  errorIsRateLimit,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={styles.block}>
      <button
        type="button"
        className={styles.blockHeader}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className={styles.blockTitle}>
          <span className={styles.blockDot} style={{ backgroundColor: `var(--color-${colorVariant})` }} />
          {title}
        </span>
        <FaChevronDown
          className={[styles.chevron, expanded ? styles.chevronOpen : ''].join(' ')}
        />
      </button>

      {expanded && (
        <div className={styles.blockContent}>
          {missions.length === 0 && <p className={styles.emptyState}>{emptyLabel}</p>}
          {missions.map((mission) => {
            const isPending = pendingMissionId === mission.id;
            return (
              <div
                key={mission.id}
                style={isPending ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
              >
                <MissionCard
                  mission={mission}
                  status={mission.status}
                  onClaim={() => onClaim(mission)}
                />
                {errorMissionId === mission.id && (
                  <p className={errorIsRateLimit ? styles.claimRateLimit : styles.claimError}>
                    {errorIsRateLimit && <FaClock className={styles.rateLimitIcon} />}
                    {errorMessage}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MissionsSimple: React.FC<MissionsSimpleProps> = ({ walletAddress, getAccessToken }) => {
  const [open, setOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem(PANEL_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  const { grouped, totalXp, isLoading, error } = useMissions(walletAddress);
  const claimMutation = useClaimMission({ address: walletAddress, getAccessToken });

  const togglePanel = () => {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(PANEL_STORAGE_KEY, String(next));
      return next;
    });
  };

  const handleClaim = (mission: Mission) => {
    claimMutation.mutate(mission.id);
  };

  const pendingMissionId = claimMutation.isPending ? claimMutation.variables : undefined;

  // 409 (stale claimed state) is self-healing: onError already refetches, and
  // once that lands the mission's real status flips to 'claimed' and the
  // button re-renders as CLAIMED on its own — no error text needed for it.
  const claimErrorStatus =
    claimMutation.isError && claimMutation.error instanceof ClaimError ? claimMutation.error.status : undefined;
  const isStaleClaim = claimErrorStatus === 409;

  const errorMissionId = claimMutation.isError && !isStaleClaim ? claimMutation.variables : undefined;
  const errorMessage = claimMutation.isError ? claimMutation.error.message : undefined;
  const errorIsRateLimit = claimErrorStatus === 429;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggleHandle}
        onClick={togglePanel}
        aria-label={open ? 'Collapse missions panel' : 'Expand missions panel'}
      >
        <FaChevronRight
          color="#ffd32a"
          style={{
            width: 14,
            height: 14,
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      <div className={styles.content} style={{ width: open ? '320px' : '0px' }}>
        {open && (
          <div className={styles.inner}>
            <div className={styles.header}>
              <span className={styles.headerTitle}>Missions</span>
              <span className={styles.headerXp}>{totalXp} XP</span>
            </div>
            <div className={styles.divider} />

            {isLoading && <p className={styles.status}>Loading missions...</p>}
            {error && <p className={styles.status}>Failed to load missions.</p>}

            {!isLoading && !error && (
              <>
                <MissionBlock
                  title="Daily"
                  colorVariant="daily"
                  missions={grouped.daily}
                  emptyLabel="No daily mission right now."
                  onClaim={handleClaim}
                  pendingMissionId={pendingMissionId}
                  errorMissionId={errorMissionId}
                  errorMessage={errorMessage}
                  errorIsRateLimit={errorIsRateLimit}
                />
                <MissionBlock
                  title="Global"
                  colorVariant="global"
                  missions={grouped.global}
                  emptyLabel="No global mission right now."
                  onClaim={handleClaim}
                  pendingMissionId={pendingMissionId}
                  errorMissionId={errorMissionId}
                  errorMessage={errorMessage}
                  errorIsRateLimit={errorIsRateLimit}
                />
                <MissionBlock
                  title="Social"
                  colorVariant="social"
                  missions={grouped.social}
                  emptyLabel="No social mission right now."
                  onClaim={handleClaim}
                  pendingMissionId={pendingMissionId}
                  errorMissionId={errorMissionId}
                  errorMessage={errorMessage}
                  errorIsRateLimit={errorIsRateLimit}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionsSimple;
