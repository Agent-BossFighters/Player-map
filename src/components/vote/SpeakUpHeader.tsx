import React from "react";
import { useState } from "react";
import { GameStats } from "../../hooks/useGameStats";
import { ipfsToHttpUrl, isIpfsUrl } from "../../utils/pinata";
import tripleSvg from "../../assets/img/triple.svg";
import { getAtomVerificationStatus } from "../../config/verifiedAtoms";
import verifiedIcon from "../../assets/img/verified.svg";
import communityIcon from "../../assets/img/community.svg";
import { useGamePublicInfo } from "../../hooks/useGamePublicInfo";
import { DEV_STEP_LABEL, DEV_STEP_COLOR } from "../../config/devStep";
import styles from "./SpeakUpHeader.module.css";

interface SpeakUpHeaderProps {
  stats: GameStats;
}

const DECORATOR: Record<string, React.CSSProperties> = {
  guild: {
    width: 28,
    height: 28,
    border: "3px solid #22c55e",
    borderRadius: 5,
  },
  player: {
    width: 28,
    height: 28,
    border: "3px solid #ffd32a",
    borderRadius: "50%",
  },
};

const BAR_GRADIENT: Record<string, string> = {
  triple: "linear-gradient(to right, #3b82f6, #f97316)",
  attestation: tripleSvg,
};

const StatCard: React.FC<{
  label: string;
  value: number | string;
  loading: boolean;
  variant: "guild" | "player" | "triple" | "attestation" | "score";
}> = ({ label, value, loading, variant }) => {
  const isBar = variant === "triple" || variant === "attestation";

  return (
    <div className={styles.statCard}>
      {/* Label */}
      <span className={styles.statLabel}>
        {label}
      </span>

      {/* Nombre + décorateur */}
      {isBar ? (
        <>
          {loading ? (
            <div className={styles.skeletonBar} />
          ) : (
            <span className={styles.statNumberLarge}>{value}</span>
          )}
          {variant === "attestation" ? (
            <img src={BAR_GRADIENT[variant]} alt={variant} className={styles.statBarImage} />
          ) : (
            <div className={styles.statBar} style={{ background: BAR_GRADIENT[variant] }} />
          )}
        </>
      ) : (
        <div
          className={`${styles.statValueBoxBase} ${
            variant === "guild" ? styles.statValueBoxGuild
            : variant === "player" ? styles.statValueBoxPlayer
            : styles.statValueBoxScore
          }`}
        >
          {loading ? (
            <div className={styles.skeleton} />
          ) : (
            <span className={styles.statNumber}>{value}</span>
          )}
        </div>
      )}
    </div>
  );
};

export const SpeakUpHeader: React.FC<SpeakUpHeaderProps> = ({ stats }) => {
  const { gameName, gameImage, gameTermId, totalGuilds, totalPlayers, totalVotes, totalAttestations, loading } = stats;
  const [showTooltip, setShowTooltip] = useState(false);

  const verification = gameTermId ? getAtomVerificationStatus(gameTermId) : null;
  const imageUrl = (gameImage && verification?.status !== 'not-verified') ? ipfsToHttpUrl(gameImage) : null;
  const { info: gamePublicInfo, isLoading: gamePublicInfoLoading } = useGamePublicInfo(gameTermId ?? undefined);
  const devStep = gamePublicInfo?.dev_step;

  return (
    <div className={styles.header}>
      {/* Titre du jeu */}
      <div className={styles.titleRow}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={gameName}
            className={styles.gameImage}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <span className={styles.gameName}>
          {loading ? "Loading..." : (gameName || "—")}
        </span>
        {verification && (
          <div
            className={styles.badgeWrapper}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {verification.status === "verified" ? (
              <img src={verifiedIcon} alt="Verified" className={styles.badgeIcon} />
            ) : verification.status === "not-verified" ? (
              <img src={communityIcon} alt="Community" className={styles.badgeIcon} />
            ) : null}
            {showTooltip && verification.status === "verified" && (
              <div className={styles.tooltip}>
                Verified by studio : This atom is approved by the rights holder.
                <div className={styles.tooltipArrow} />
              </div>
            )}
            {showTooltip && verification.status === "not-verified" && (
              <div className={styles.tooltip}>
                Community created : This atom is community-created and has not been reviewed or approved by the rights holder.
                <div className={styles.tooltipArrow} />
              </div>
            )}
          </div>
        )}
        {devStep && (
          <span
            className={styles.devStepBadge}
            style={{
              color: DEV_STEP_COLOR[devStep],
              borderColor: `${DEV_STEP_COLOR[devStep]}40`,
              background: `${DEV_STEP_COLOR[devStep]}14`,
            }}
          >
            {DEV_STEP_LABEL[devStep]}
          </span>
        )}
      </div>

      {/* Statistiques */}
      <div className={styles.statsRow}>
        <StatCard label="Guild(s)"       value={totalGuilds}       loading={false}   variant="guild" />
        <div className={styles.statsDivider} />
        <StatCard label="Player(s)"      value={totalPlayers}      loading={loading} variant="player" />
        <div className={styles.statsDivider} />
        <StatCard label="Score"          value={gamePublicInfo?.game_score.overall ?? "—"} loading={gamePublicInfoLoading} variant="score" />
        <div className={styles.statsDivider} />
        <StatCard label="Attestation(s)"  value={totalAttestations} loading={loading} variant="attestation" />
        <div className={styles.statsDivider} />
        <StatCard label="Vote(s)"        value={totalVotes}        loading={loading} variant="triple" />
      </div>
    </div>
  );
};

export default SpeakUpHeader;
