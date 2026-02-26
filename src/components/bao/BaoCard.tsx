import React, { useRef, useCallback } from 'react';
import { BaoDefinition, OwnedBao } from '../../types';
import { RARITY_CONFIG } from '../../utils/rarity';
import BaoArt from './BaoArt';
import RarityBadge from './RarityBadge';

interface BaoCardProps {
  bao: BaoDefinition;
  owned?: OwnedBao;
  onClick?: () => void;
  showSilhouette?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * BaoCard — Card component for displaying a bao in grids.
 * Shows full art when owned, or a gray silhouette when unowned.
 */
const BaoCard: React.FC<BaoCardProps> = ({ bao, owned, onClick, showSilhouette = false, className, compact = false }) => {
  const isHidden = showSilhouette && !owned;
  const rarityConfig = RARITY_CONFIG[bao.rarity];
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.classList.add('card-popping');
      setTimeout(() => {
        cardRef.current?.classList.remove('card-popping');
      }, 300);
    }
    onClick?.();
  }, [onClick]);

  const renderRankStars = (rank: number) => {
    if (rank === 0) return null;
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < rank; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: '#fbbf24',
            fontSize: '10px',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      );
    }
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1px',
          justifyContent: 'center',
          maxWidth: '100%',
        }}
      >
        {stars}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      style={{
        ...styles.card,
        ...(compact ? styles.cardCompact : {}),
        borderLeft: `4px solid ${rarityConfig.color}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      className={`bao-card${className ? ` ${className}` : ''}`}
    >
      {/* Art container */}
      <div
        style={{
          ...styles.artWrap,
          ...(isHidden ? styles.silhouette : {}),
        }}
      >
        <BaoArt
          baoId={bao.id}
          baseColor={bao.baseColor}
          accentColor={bao.accentColor}
          pattern={bao.pattern}
          faceExpression={bao.faceExpression}
          rank={owned?.rank ?? 0}
          size={compact ? 70 : 90}
        />
      </div>

      {/* Info area */}
      <div style={styles.info}>
        <div style={compact ? styles.nameCompact : styles.name}>
          {isHidden ? '???' : bao.name}
        </div>

        {!isHidden && (
          <>
            <RarityBadge rarity={bao.rarity} />

            {!compact && owned && (
              <div style={styles.meta}>
                {owned.count > 1 && (
                  <span style={styles.count}>x{owned.count}</span>
                )}
                {renderRankStars(owned.rank)}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .bao-card {
          transition: transform 0.25s var(--ease-bounce), box-shadow 0.25s var(--ease-smooth);
        }
        .bao-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(74, 55, 40, 0.15), 0 2px 8px rgba(74, 55, 40, 0.1);
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 8px 10px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-surface)',
    boxShadow: '0 2px 8px rgba(74, 55, 40, 0.08)',
    width: '100%',
    minWidth: 0,
    aspectRatio: '2 / 3',
    justifyContent: 'center',
  },
  cardCompact: {
    padding: '8px 6px 6px',
    gap: '4px',
    aspectRatio: '2 / 3',
  },
  artWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouette: {
    filter: 'grayscale(1) brightness(0.45)',
    opacity: 0.5,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    minWidth: 0,
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-text)',
    textAlign: 'center',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  nameCompact: {
    fontFamily: 'var(--font-display)',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-text)',
    textAlign: 'center',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    marginTop: '2px',
  },
  count: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
  },
};

export default BaoCard;
