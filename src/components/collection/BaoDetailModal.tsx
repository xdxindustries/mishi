import React from 'react';
import { BaoDefinition, OwnedBao, BaoId } from '../../types';
import Modal from '../common/Modal';
import BaoArt from '../bao/BaoArt';
import RarityBadge from '../bao/RarityBadge';
import UpgradePanel from './UpgradePanel';

interface BaoDetailModalProps {
  bao: BaoDefinition;
  owned: OwnedBao | undefined;
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (baoId: BaoId) => void;
}

/**
 * BaoDetailModal — Full detail view when clicking a bao card.
 * Shows large art, name, rarity, description, stats, and upgrade panel.
 */
const BaoDetailModal: React.FC<BaoDetailModalProps> = ({
  bao,
  owned,
  isOpen,
  onClose,
  onUpgrade,
}) => {
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

  const renderRankStars = (rank: number) => {
    if (rank === 0) return null;
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < rank; i++) {
      stars.push(
        <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>
          ★
        </span>
      );
    }
    return (
      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {stars}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={styles.container}>
        {/* Large Bao Art */}
        <div style={styles.artSection}>
          <BaoArt
            baoId={bao.id}
            baseColor={bao.baseColor}
            accentColor={bao.accentColor}
            pattern={bao.pattern}
            faceExpression={bao.faceExpression}
            rank={owned?.rank ?? 0}
            size={200}
          />
        </div>

        {/* Name and badge */}
        <h2 style={styles.name}>{bao.name}</h2>
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
                <span style={styles.statLabel}>Rank</span>
                <span style={styles.statValue}>{owned.rank}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>First Pulled</span>
                <span style={styles.statValue}>{formatDate(owned.firstPulledAt)}</span>
              </div>
            </div>

            {renderRankStars(owned.rank)}
          </div>
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  artSection: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: 0,
    textAlign: 'center',
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
    margin: '4px 0 8px',
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 0',
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
