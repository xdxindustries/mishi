import React from 'react';
import { BaoDefinition, OwnedBao, BaoId, DUPES_TO_UPGRADE, MAX_RANK } from '../../types';
import { RARITY_CONFIG } from '../../utils/rarity';
import Button from '../common/Button';

interface UpgradePanelProps {
  bao: BaoDefinition;
  owned: OwnedBao;
  onUpgrade: (baoId: BaoId) => void;
}

/**
 * UpgradePanel — Shows rank progress and upgrade button within the detail modal.
 */
const UpgradePanel: React.FC<UpgradePanelProps> = ({ bao, owned, onUpgrade }) => {
  const isMaxRank = owned.rank >= MAX_RANK;
  const canUpgrade = owned.count >= DUPES_TO_UPGRADE && !isMaxRank;
  const needed = DUPES_TO_UPGRADE - owned.count;
  const progressPercent = isMaxRank
    ? 100
    : Math.min((owned.count / DUPES_TO_UPGRADE) * 100, 100);
  const rarityColor = RARITY_CONFIG[bao.rarity].color;

  return (
    <div style={styles.container}>
      {/* Rank display */}
      <div style={styles.rankRow}>
        <span style={styles.rankLabel}>Rank</span>
        <span style={styles.rankValue}>
          {owned.rank} / {MAX_RANK}
        </span>
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progressPercent}%`,
            background: isMaxRank
              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
              : `linear-gradient(90deg, ${rarityColor}, ${rarityColor}dd)`,
          }}
        />
        {!isMaxRank && (
          <span style={styles.progressText}>
            {owned.count} / {DUPES_TO_UPGRADE}
          </span>
        )}
      </div>

      {/* Action area */}
      <div style={styles.actionRow}>
        {isMaxRank && (
          <div style={styles.maxBadge} className="upgrade-max-badge">
            MAX RANK
          </div>
        )}

        {canUpgrade && (
          <div className="upgrade-button-wrap">
            <Button
              variant="special"
              onClick={() => onUpgrade(bao.id)}
            >
              Upgrade!
            </Button>
          </div>
        )}

        {!isMaxRank && !canUpgrade && (
          <span style={styles.needMore}>
            Need {needed} more to upgrade
          </span>
        )}
      </div>

      <style>{`
        .upgrade-max-badge {
          background: linear-gradient(135deg, #fbbf24, #fcd34d);
          color: #78350f;
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 6px 20px;
          border-radius: var(--radius-full);
          border: 2px solid #f59e0b;
          box-shadow: 0 0 16px rgba(251, 191, 36, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }
        .upgrade-button-wrap {
          position: relative;
        }
        .upgrade-button-wrap::before,
        .upgrade-button-wrap::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: #fbbf24;
          border-radius: 50%;
          animation: sparkle 1.5s ease-in-out infinite;
          pointer-events: none;
        }
        .upgrade-button-wrap::before {
          top: -4px;
          right: -4px;
          animation-delay: 0s;
        }
        .upgrade-button-wrap::after {
          bottom: -4px;
          left: -4px;
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-warm)',
    border: '1px solid rgba(74, 55, 40, 0.08)',
  },
  rankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
  },
  rankValue: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
  },
  progressTrack: {
    position: 'relative',
    width: '100%',
    height: '20px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(74, 55, 40, 0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)',
    transition: 'width 0.5s var(--ease-bounce)',
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    textShadow: '0 0 4px rgba(255,255,255,0.8)',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '4px',
  },
  maxBadge: {},
  needMore: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
  },
};

export default UpgradePanel;
