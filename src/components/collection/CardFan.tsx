import React, { useMemo } from 'react';
import { BaoDefinition, OwnedBao, BaoId } from '../../types';
import BaoCard from '../bao/BaoCard';

interface CardFanProps {
  items: Array<{ bao: BaoDefinition; owned?: OwnedBao }>;
  onCardClick?: (baoId: BaoId) => void;
  showSilhouettes?: boolean;
  size?: 'sm' | 'md' | 'lg';
  staggerReveal?: boolean;
  staggerDelay?: number;
  guaranteedIndex?: number;
}

/**
 * CardFan — Horizontal fan layout for BaoCards with kawaii float animation.
 * Cards spread in an arc with rotation and overlap.
 */
const CardFan: React.FC<CardFanProps> = ({
  items,
  onCardClick,
  showSilhouettes = false,
  size = 'md',
  staggerReveal = false,
  staggerDelay = 250,
  guaranteedIndex,
}) => {
  const fanData = useMemo(() => {
    const count = items.length;
    const midpoint = (count - 1) / 2;
    const spreadFactor = count <= 2 ? 0 : Math.min(4, 12 / Math.max(count - 1, 1));

    return items.map((item, index) => {
      const rotation = count <= 2 ? 0 : Math.max(-12, Math.min(12, (index - midpoint) * spreadFactor));
      const distFromCenter = Math.abs(index - midpoint);
      const zIndex = Math.round((count - distFromCenter) * 10);

      return {
        item,
        rotation,
        zIndex,
        index,
      };
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <div style={emptyStyles.container}>
        <div style={emptyStyles.icon}>( . _ .)</div>
        <p style={emptyStyles.text}>Nothing here yet!</p>
      </div>
    );
  }

  return (
    <div className={`card-fan-container fan-${size}`}>
      {fanData.map(({ item, rotation, zIndex, index }) => {
        let className = 'card-fan-item';
        if (staggerReveal) {
          className += ' stagger-reveal';
          if (guaranteedIndex !== undefined && index === guaranteedIndex) {
            className += ' guaranteed-card';
          }
        }

        return (
          <div
            key={`${item.bao.id}-${index}`}
            className={className}
            style={{
              '--card-rotate': `${rotation}deg`,
              '--card-z': zIndex,
              '--card-index': index,
            } as React.CSSProperties}
          >
            <BaoCard
              bao={item.bao}
              owned={item.owned}
              onClick={onCardClick ? () => onCardClick(item.bao.id) : undefined}
              showSilhouette={showSilhouettes}
              compact={true}
            />
          </div>
        );
      })}
    </div>
  );
};

const emptyStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '12px',
  },
  icon: {
    fontSize: '32px',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
  },
  text: {
    fontSize: '15px',
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
  },
};

export default CardFan;
