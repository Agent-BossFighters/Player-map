import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaClock, FaFire } from 'react-icons/fa';
import { useMissions } from '../missions/shared/useMissions';
import { useClaimMission } from '../missions/shared/useClaimMission';
import { ClaimError } from '../missions/shared/claimApi';
import MissionCard from '../missions/shared/MissionCard';
import type { Mission } from '../types/Missions';
import MissionsExpanded from './MissionsExpanded';
import styles from './MissionsSimple.module.css';

const PANEL_STORAGE_KEY = 'playermap_missionsPanelOpen';

type MissionCategory = 'daily' | 'global' | 'social';

interface MissionsSimpleProps {
  walletAddress?: string;
  getAccessToken?: () => Promise<string | null>;
  onOpenQuestModal?: (missionId: string) => void;
}

interface MissionBlockProps {
  title: string;
  colorVariant: MissionCategory;
  missions: Mission[];
  emptyLabel: string;
  onClaim: (mission: Mission) => void;
  pendingMissionId?: string;
  errorMissionId?: string;
  errorMessage?: string;
  errorIsRateLimit?: boolean;
  onOpenQuestModal?: (missionId: string) => void;
  onSeeMore: (category: MissionCategory) => void;
  streak?: number;
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
  onOpenQuestModal,
  onSeeMore,
  streak,
}) => {
  const [expanded, setExpanded] = useState(true);

  // Panel is a preview: show the first not-yet-claimed mission (existing
  // order), or the last one (claimed, greyed) if the whole group is done —
  // never an empty block when missions actually exist.
  const visibleMission = missions.length === 0 ? undefined : (missions.find((m) => m.status !== 'claimed') ?? missions[missions.length - 1]);
  const categoryXp = missions.reduce((sum, m) => sum + m.reward.xp, 0);

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
        <span className={styles.blockHeaderRight}>
          {!!streak && (
            <span className={styles.streakBadge}>
              <FaFire className={styles.streakIcon} /> {streak}
            </span>
          )}
          <span className={styles.blockXp}>{categoryXp} PX</span>
          <FaChevronDown
            className={[styles.chevron, expanded ? styles.chevronOpen : ''].join(' ')}
          />
        </span>
      </button>

      {expanded && (
        <div className={styles.blockContent}>
          {!visibleMission && <p className={styles.emptyState}>{emptyLabel}</p>}
          {visibleMission && (
            <div
              key={visibleMission.id}
              style={pendingMissionId === visibleMission.id ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
            >
              <MissionCard
                mission={visibleMission}
                status={visibleMission.status}
                onClaim={() => onClaim(visibleMission)}
                onOpenQuestModal={onOpenQuestModal}
              />
              {errorMissionId === visibleMission.id && (
                <p className={errorIsRateLimit ? styles.claimRateLimit : styles.claimError}>
                  {errorIsRateLimit && <FaClock className={styles.rateLimitIcon} />}
                  {errorMessage}
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            className={styles.seeMoreBtn}
            onClick={(e) => {
              e.stopPropagation();
              onSeeMore(colorVariant);
            }}
          >
            See more
          </button>
        </div>
      )}
    </div>
  );
};

const MissionsSimple: React.FC<MissionsSimpleProps> = ({ walletAddress, getAccessToken, onOpenQuestModal }) => {
  const [open, setOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem(PANEL_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  const { grouped, totalXp, isLoading, error } = useMissions(walletAddress);
  const claimMutation = useClaimMission({ address: walletAddress, getAccessToken });

  const [expandedOpen, setExpandedOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<MissionCategory>('daily');

  const handleSeeMore = (category: MissionCategory) => {
    setExpandedCategory(category);
    setExpandedOpen(true);
  };

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

  const dailyLoginStreak = grouped.daily.find((m) => m.id === 'daily-login' && m.type === 'daily')?.streak;

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
                  onOpenQuestModal={onOpenQuestModal}
                  onSeeMore={handleSeeMore}
                  streak={dailyLoginStreak}
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
                  onOpenQuestModal={onOpenQuestModal}
                  onSeeMore={handleSeeMore}
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
                  onOpenQuestModal={onOpenQuestModal}
                  onSeeMore={handleSeeMore}
                />
              </>
            )}
          </div>
        )}
      </div>

      <MissionsExpanded
        isOpen={expandedOpen}
        initialCategory={expandedCategory}
        walletAddress={walletAddress}
        getAccessToken={getAccessToken}
        onOpenQuestModal={onOpenQuestModal}
        onClose={() => setExpandedOpen(false)}
      />
    </div>
  );
};

export default MissionsSimple;
