import React from 'react';
import { BaoDefinition, OwnedBao, BaoId } from '../../types';
import BaoCard from '../bao/BaoCard';

interface CollectionGridProps {
  items: Array<{ bao: BaoDefinition; owned?: OwnedBao }>;
  onCardClick: (baoId: BaoId) => void;
  showSilhouettes?: boolean;
}

/**
 * CollectionGrid — Responsive CSS Grid layout for BaoCards.
 * 2 cols on mobile, 3-4 on tablet, 5-6 on desktop.
 */
const CollectionGrid: React.FC<CollectionGridProps> = ({
  items,
  onCardClick,
  showSilhouettes = false,
}) => {
  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>( . _ .)</div>
        <p style={styles.emptyText}>Nothing here yet!</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.grid} className="collection-grid">
        {items.map((item, index) => (
          <BaoCard
            key={`${item.bao.id}-${index}`}
            bao={item.bao}
            owned={item.owned}
            onClick={() => onCardClick(item.bao.id)}
            showSilhouette={showSilhouettes}
          />
        ))}
      </div>

      <style>{`
        .collection-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
        }
        @media (min-width: 480px) {
          .collection-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 700px) {
          .collection-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
          }
        }
        @media (min-width: 960px) {
          .collection-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1200px) {
          .collection-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: {
    width: '100%',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '12px',
  },
  emptyIcon: {
    fontSize: '32px',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
  },
  emptyText: {
    fontSize: '15px',
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
  },
};

export default CollectionGrid;
