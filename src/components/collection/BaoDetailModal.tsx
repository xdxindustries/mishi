import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BaoDefinition, OwnedBao, BaoId, Rarity, MAX_RANK } from '../../types';
import Modal from '../common/Modal';
import BaoArt from '../bao/BaoArt';
import RarityBadge from '../bao/RarityBadge';
import UpgradePanel from './UpgradePanel';
import UpgradeAnimation from './UpgradeAnimation';
import { RARITY_CONFIG } from '../../utils/rarity';
import { BAO_TITLES } from '../../config/starBenefits';

interface BaoDetailModalProps {
  bao: BaoDefinition;
  owned: OwnedBao | undefined;
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (baoId: BaoId) => void;
}

const BaoDetailModal: React.FC<BaoDetailModalProps> = ({
  bao,
  owned,
  isOpen,
  onClose,
  onUpgrade,
}) => {
  const [showcaseTrigger, setShowcaseTrigger] = useState(0);
  const [showUpgradeAnim, setShowUpgradeAnim] = useState(false);
  const [animRank, setAnimRank] = useState(0);
  const prevRankRef = useRef(owned?.rank ?? 0);

  // Detect rank changes to trigger upgrade animation
  useEffect(() => {
    const currentRank = owned?.rank ?? 0;
    if (currentRank > prevRankRef.current && prevRankRef.current >= 0) {
      setAnimRank(currentRank);
      setShowUpgradeAnim(true);
    }
    prevRankRef.current = currentRank;
  }, [owned?.rank]);

  const handleBaoTap = useCallback(() => {
    // Legendaries always get showcase; others need ★4
    if (owned && (bao.rarity === Rarity.Legendary || owned.rank >= 4)) {
      setShowcaseTrigger((prev) => prev + 1);
    }
  }, [owned, bao.rarity]);

  const handleUpgradeAnimComplete = useCallback(() => {
    setShowUpgradeAnim(false);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const rank = owned?.rank ?? 0;
  const title = rank >= 3 ? BAO_TITLES[bao.id as BaoId] : null;
  const isLegendary = bao.rarity === Rarity.Legendary;
  // Legendaries always get showcase; others need ★4
  const canShowcase = owned && (isLegendary || rank >= 4);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={styles.container}>
        {/* Upgrade celebration overlay */}
        {showUpgradeAnim && (
          <UpgradeAnimation
            newRank={animRank}
            rarityColor={RARITY_CONFIG[bao.rarity].color}
            onComplete={handleUpgradeAnimComplete}
          />
        )}

        {/* Large Bao Art — tap to trigger showcase animation (★4+) */}
        <div
          style={{
            ...styles.artSection,
            cursor: canShowcase ? 'pointer' : 'default',
          }}
          onClick={handleBaoTap}
        >
          <BaoArt
            baoId={bao.id}
            baseColor={bao.baseColor}
            accentColor={bao.accentColor}
            pattern={bao.pattern}
            faceExpression={bao.faceExpression}
            rank={rank}
            size={150}
            showcaseMode={!!canShowcase}
            rarity={bao.rarity}
            triggerShowcase={showcaseTrigger}
            artUrl={bao.artUrl}
          />
        </div>

        {/* Star display — 5 slots */}
        {owned && (
          <div style={styles.starRow}>
            {Array.from({ length: MAX_RANK }, (_, i) => (
              <span
                key={i}
                style={{
                  fontSize: '16px',
                  color: i < rank ? '#fbbf24' : 'rgba(74, 55, 40, 0.15)',
                  textShadow: i < rank ? '0 0 6px rgba(251, 191, 36, 0.4)' : 'none',
                  transition: 'color 0.3s, text-shadow 0.3s',
                }}
              >
                ★
              </span>
            ))}
          </div>
        )}

        {/* Name and badge */}
        <h2 style={styles.name}>{bao.name}</h2>
        {title && <div style={styles.title}>{title}</div>}
        <div style={styles.badgeRow}>
          <RarityBadge rarity={bao.rarity} />
        </div>

        {/* Description */}
        <p style={styles.description}>{bao.description}</p>

        {/* Owned stats */}
        {owned && (
          <div style={styles.statsSection}>
            <div style={styles.statsGrid}>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Owned</span>
                <span style={styles.statValue}>x{owned.count}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>First Pulled</span>
                <span style={styles.statValue}>{formatDate(owned.firstPulledAt)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Showcase hint */}
        {canShowcase && (
          <div style={styles.showcaseHint}>Tap the bao for special effects!</div>
        )}

        {/* Not owned message */}
        {!owned && (
          <div style={styles.notOwned}>
            You haven't pulled this bao yet!
          </div>
        )}

        {/* Upgrade panel */}
        {owned && (
          <UpgradePanel bao={bao} owned={owned} onUpgrade={onUpgrade} />
        )}
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  artSection: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0',
  },
  starRow: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: 0,
    textAlign: 'center',
  },
  title: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#d97706',
    fontFamily: 'var(--font-body)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '-4px',
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'center',
  },
  description: {
    fontSize: '14px',
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
    textAlign: 'center',
    lineHeight: 1.5,
    maxWidth: '360px',
    margin: '2px 0 4px',
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    padding: '8px 0',
    borderTop: '1px solid rgba(74, 55, 40, 0.08)',
    borderBottom: '1px solid rgba(74, 55, 40, 0.08)',
  },
  statsGrid: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'var(--font-body)',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
  },
  showcaseHint: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  notOwned: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '12px 0',
  },
};

export default BaoDetailModal;
