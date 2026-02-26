import React from 'react';
import { Rarity } from '../../types';
import { RARITY_CONFIG } from '../../utils/rarity';

interface CollectionFiltersProps {
  activeRarity: Rarity | null;
  onRarityFilter: (r: Rarity | null) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
}

const RARITY_OPTIONS: Array<{ value: Rarity | null; label: string; color: string }> = [
  { value: null, label: 'All', color: 'var(--color-text-light)' },
  { value: Rarity.Common, label: 'Common', color: RARITY_CONFIG[Rarity.Common].color },
  { value: Rarity.Uncommon, label: 'Uncommon', color: RARITY_CONFIG[Rarity.Uncommon].color },
  { value: Rarity.Rare, label: 'Rare', color: RARITY_CONFIG[Rarity.Rare].color },
  { value: Rarity.Epic, label: 'Epic', color: RARITY_CONFIG[Rarity.Epic].color },
  { value: Rarity.Legendary, label: 'Legendary', color: RARITY_CONFIG[Rarity.Legendary].color },
];

const SORT_OPTIONS = [
  { value: 'rarity', label: 'By Rarity' },
  { value: 'count', label: 'By Count' },
  { value: 'name', label: 'By Name' },
  { value: 'date', label: 'By Date' },
];

/**
 * CollectionFilters — Row of rarity filter pills and a sort dropdown.
 */
const CollectionFilters: React.FC<CollectionFiltersProps> = ({
  activeRarity,
  onRarityFilter,
  sortBy,
  onSortChange,
}) => {
  return (
    <div style={styles.container}>
      {/* Rarity filter pills */}
      <div style={styles.pills}>
        {RARITY_OPTIONS.map((opt) => {
          const isActive = activeRarity === opt.value;
          return (
            <button
              key={opt.label}
              onClick={() => onRarityFilter(opt.value)}
              style={{
                ...styles.pill,
                background: isActive ? opt.color : 'transparent',
                color: isActive ? '#fff' : opt.color,
                border: `2px solid ${opt.color}`,
                fontWeight: isActive ? 700 : 600,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Sort dropdown */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        style={styles.select}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    width: '100%',
  },
  pills: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    flex: 1,
    minWidth: 0,
  },
  pill: {
    padding: '5px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    transition: 'all 0.2s var(--ease-smooth)',
    whiteSpace: 'nowrap',
    lineHeight: 1.3,
  },
  select: {
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--color-secondary)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '13px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    flexShrink: 0,
  },
};

export default CollectionFilters;
