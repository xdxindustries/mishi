import React from 'react';
import { BaoDefinition, OwnedBao, BaoId, MAX_RANK, getUpgradeCost } from '../../types';
import { RARITY_CONFIG } from '../../utils/rarity';
import { getNextBenefit } from '../../config/starBenefits';
import Button from '../common/Button';

interface UpgradePanelProps {
  bao: BaoDefinition;
  owned: OwnedBao;
  onUpgrade: (baoId: BaoId) => void;
}

const UpgradePanel: React.FC<UpgradePanelProps> = ({ bao, owned, onUpgrade }) => {
  const isMaxRank = owned.rank >= MAX_RANK;
  const cost = getUpgradeCost(owned.rank);
  const canUpgrade = cost > 0 && owned.count >= cost && !isMaxRank;
  const needed = cost > 0 ? cost - owned.count : 0;
  const progressPercent = isMaxRank
    ? 100
    : cost > 0 ? Math.min((owned.count / cost) * 100, 100) : 0;
  const rarityColor = RARITY_CONFIG[bao.rarity].color;
  const nextBenefit = getNextBenefit(owned.rank);

  return (
    <div style={styles.container}>
      {/* Rank display */}
      <div style={styles.rankRow}>
        <span style={styles.rankLabel}>Star Rank</span>
        <span style={styles.rankValue}>
          {'★'.repeat(owned.rank)}{'☆'.repeat(MAX_RANK - owned.rank)}
        </span>
      </div>

      {/* Progress bar */}
      {!isMaxRank && (
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${rarityColor}, ${rarityColor}dd)`,
            }}
          />
          <span style={styles.progressText}>
            {owned.count} / {cost}
          </span>
        </div>
      )}

      {/* Next benefit preview */}
      {!isMaxRank && nextBenefit && (
        <div style={styles.benefitPreview}>
          <span style={styles.benefitLabel}>Next unlock:</span>
          <span style={styles.benefitText}>
            ★{nextBenefit.star} {nextBenefit.label}
          </span>
        </div>
      )}

      {/* Action area */}
      <div style={styles.actionRow}>
        {isMaxRank && (
          <div style={styles.maxBadge} className="upgrade-max-badge">
            ★ MAX RANK ★
          </div>
        )}

        {canUpgrade && (
          <div className="upgrade-button-wrap">
            <Button
              variant="special"
              onClick={() => onUpgrade(bao.id)}
            >
              Upgrade to ★{owned.rank + 1}
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
    gap: '8px',
    padding: '10px 14px',
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
    fontSize: '16px',
    fontWeight: 700,
    color: '#fbbf24',
    fontFamily: 'var(--font-display)',
    letterSpacing: '2px',
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
  benefitPreview: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  benefitText: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#fbbf24',
    fontFamily: 'var(--font-display)',
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
