import React from 'react';
import { Rarity } from '../../types';

interface RarityBadgeProps {
  rarity: Rarity;
}

const RARITY_CONFIG: Record<Rarity, { label: string; bg: string; text: string; border: string; glow?: string }> = {
  [Rarity.Common]: {
    label: 'Common',
    bg: '#f5f4f2',
    text: '#9e9a95',
    border: '#e2e0dd',
  },
  [Rarity.Uncommon]: {
    label: 'Uncommon',
    bg: '#dcfce7',
    text: '#16a34a',
    border: '#4ade80',
  },
  [Rarity.Rare]: {
    label: 'Rare',
    bg: '#dbeafe',
    text: '#2563eb',
    border: '#60a5fa',
  },
  [Rarity.Epic]: {
    label: 'Epic',
    bg: '#f3e8ff',
    text: '#7c3aed',
    border: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.3)',
  },
  [Rarity.Legendary]: {
    label: 'Legendary',
    bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    text: '#b45309',
    border: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.4)',
  },
};

/**
 * RarityBadge — A small pill/badge showing rarity name with the rarity color.
 */
const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity }) => {
  const config = RARITY_CONFIG[rarity];

  return (
    <span
      className="rarity-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        color: config.text,
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        boxShadow: config.glow ? `0 0 8px ${config.glow}` : 'none',
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Rarity dot indicator */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.border,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
};

export default RarityBadge;
