import React, { useState, useMemo } from 'react';
import { Player, BaoId, Rarity, BaoDefinition, OwnedBao } from '../types';
import { ALL_BAO, getBaoById } from '../config/baoData';
import { RARITY_CONFIG, compareByRarity } from '../utils/rarity';
import CardFan from '../components/collection/CardFan';
import CollectionFilters from '../components/collection/CollectionFilters';
import BaoDetailModal from '../components/collection/BaoDetailModal';

interface CollectionPageProps {
  player: Player;
  onUpgrade: (baoId: BaoId) => void;
}

/**
 * CollectionPage — "My Collection" page showing owned bao
 * with filtering, sorting, and detail modal.
 */
const CollectionPage: React.FC<CollectionPageProps> = ({ player, onUpgrade }) => {
  const [activeRarity, setActiveRarity] = useState<Rarity | null>(null);
  const [sortBy, setSortBy] = useState<string>('rarity');
  const [selectedBaoId, setSelectedBaoId] = useState<BaoId | null>(null);

  // Build owned items list
  const ownedItems = useMemo(() => {
    const items: Array<{ bao: BaoDefinition; owned: OwnedBao }> = [];

    for (const key of Object.keys(player.collection)) {
      const ownedBao = player.collection[key];
      try {
        const bao = getBaoById(ownedBao.baoId);
        items.push({ bao, owned: ownedBao });
      } catch {
        // Skip unknown bao
      }
    }

    return items;
  }, [player.collection]);

  // Filter
  const filteredItems = useMemo(() => {
    if (!activeRarity) return ownedItems;
    return ownedItems.filter((item) => item.bao.rarity === activeRarity);
  }, [ownedItems, activeRarity]);

  // Sort
  const sortedItems = useMemo(() => {
    const items = [...filteredItems];

    switch (sortBy) {
      case 'rarity':
        items.sort((a, b) => compareByRarity(a.bao.rarity, b.bao.rarity));
        break;
      case 'count':
        items.sort((a, b) => b.owned.count - a.owned.count);
        break;
      case 'name':
        items.sort((a, b) => a.bao.name.localeCompare(b.bao.name));
        break;
      case 'date':
        items.sort((a, b) =>
          new Date(b.owned.firstPulledAt).getTime() - new Date(a.owned.firstPulledAt).getTime()
        );
        break;
    }

    return items;
  }, [filteredItems, sortBy]);

  // Selected bao for detail modal
  const selectedBao = selectedBaoId ? (() => {
    try { return getBaoById(selectedBaoId); } catch { return null; }
  })() : null;
  const selectedOwned = selectedBaoId ? player.collection[selectedBaoId] : undefined;

  const totalBao = ALL_BAO.length;
  const ownedCount = Object.keys(player.collection).length;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Collection</h1>
        <span style={styles.counter}>
          {ownedCount} / {totalBao}
        </span>
      </div>

      {/* Filters */}
      {ownedItems.length > 0 && (
        <CollectionFilters
          activeRarity={activeRarity}
          onRarityFilter={setActiveRarity}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}

      {/* Grid or empty state */}
      {ownedItems.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>~( ^o^)~</div>
          <h3 style={styles.emptyTitle}>No bao yet!</h3>
          <p style={styles.emptyText}>Go pull some to start your collection!</p>
        </div>
      ) : (
        <CardFan
          items={sortedItems}
          onCardClick={(baoId) => setSelectedBaoId(baoId)}
          size="md"
        />
      )}

      {/* Detail modal */}
      {selectedBao && (
        <BaoDetailModal
          bao={selectedBao}
          owned={selectedOwned}
          isOpen={!!selectedBaoId}
          onClose={() => setSelectedBaoId(null)}
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    padding: 'var(--space-lg)',
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: 0,
  },
  counter: {
    fontFamily: 'var(--font-body)',
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--color-text-muted)',
    background: 'var(--color-bg-warm)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    gap: '8px',
  },
  emptyIcon: {
    fontSize: '40px',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    color: 'var(--color-text)',
    margin: 0,
  },
  emptyText: {
    fontSize: '15px',
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
    margin: 0,
  },
};

export default CollectionPage;
