import { Rarity } from '../types';

export interface RarityConfig {
  label: string;
  color: string;
  bgColor: string;
  glowColor: string;
  sortOrder: number;
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  [Rarity.Common]: {
    label: 'Common',
    color: '#9ca3af',
    bgColor: '#f3f4f6',
    glowColor: '#d1d5db',
    sortOrder: 0,
  },
  [Rarity.Uncommon]: {
    label: 'Uncommon',
    color: '#4ade80',
    bgColor: '#dcfce7',
    glowColor: '#86efac',
    sortOrder: 1,
  },
  [Rarity.Rare]: {
    label: 'Rare',
    color: '#60a5fa',
    bgColor: '#dbeafe',
    glowColor: '#93bbfd',
    sortOrder: 2,
  },
  [Rarity.Epic]: {
    label: 'Epic',
    color: '#a855f7',
    bgColor: '#f3e8ff',
    glowColor: '#c084fc',
    sortOrder: 3,
  },
  [Rarity.Legendary]: {
    label: 'Legendary',
    color: '#fbbf24',
    bgColor: '#fef3c7',
    glowColor: '#fcd34d',
    sortOrder: 4,
  },
};

export function getRarityColor(rarity: Rarity): string {
  return RARITY_CONFIG[rarity].color;
}

export function getRarityLabel(rarity: Rarity): string {
  return RARITY_CONFIG[rarity].label;
}

/**
 * Compare two rarities for sorting. Higher rarity (Legendary) sorts first.
 */
export function compareByRarity(a: Rarity, b: Rarity): number {
  return RARITY_CONFIG[b].sortOrder - RARITY_CONFIG[a].sortOrder;
}
