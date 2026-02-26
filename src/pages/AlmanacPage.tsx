import React, { useMemo } from 'react';
import { Player, Rarity, BaoDefinition } from '../types';
import { ALL_BAO } from '../config/baoData';
import { RARITY_CONFIG } from '../utils/rarity';
import BaoCard from '../components/bao/BaoCard';

interface AlmanacPageProps {
  player: Player;
}

/** Rarity tiers in display order (highest first). */
const TIER_ORDER: Rarity[] = [
  Rarity.Legendary,
  Rarity.Epic,
  Rarity.Rare,
  Rarity.Uncommon,
  Rarity.Common,
];

/**
 * AlmanacPage — "Bao Almanac" catalog of all 21 bao, grouped by rarity.
 * Owned bao show full art; unowned show as gray silhouettes.
 */
const AlmanacPage: React.FC<AlmanacPageProps> = ({ player }) => {
  // Group bao by rarity tier
  const tiers = useMemo(() => {
    const grouped: Record<Rarity, BaoDefinition[]> = {
      [Rarity.Legendary]: [],
      [Rarity.Epic]: [],
      [Rarity.Rare]: [],
      [Rarity.Uncommon]: [],
      [Rarity.Common]: [],
    };

    for (const bao of ALL_BAO) {
      grouped[bao.rarity].push(bao);
    }

    return TIER_ORDER.map((rarity) => ({
      rarity,
      config: RARITY_CONFIG[rarity],
      bao: grouped[rarity],
    })).filter((tier) => tier.bao.length > 0);
  }, []);

  const totalBao = ALL_BAO.length;
  const ownedCount = Object.keys(player.collection).length;
  const completionPct = totalBao > 0 ? Math.round((ownedCount / totalBao) * 100) : 0;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Bao Almanac</h1>
        <span style={styles.completion}>
          {completionPct}% Complete ({ownedCount}/{totalBao})
        </span>
      </div>

      {/* Tiers */}
      {tiers.map((tier) => (
        <section key={tier.rarity} style={styles.tierSection}>
          {/* Tier header */}
          <div style={styles.tierHeader}>
            <div
              style={{
                ...styles.tierDot,
                background: tier.config.color,
                boxShadow: `0 0 8px ${tier.config.glowColor}`,
              }}
            />
            <h2 style={{ ...styles.tierTitle, color: tier.config.color }}>
              {tier.config.label}
            </h2>
            <div style={styles.tierLine} />
          </div>

          {/* Tier grid */}
          <div style={styles.tierGrid} className="almanac-tier-grid">
            {tier.bao.map((bao) => {
              const owned = player.collection[bao.id];
              return (
                <BaoCard
                  key={bao.id}
                  bao={bao}
                  owned={owned}
                  showSilhouette={true}
                />
              );
            })}
          </div>
        </section>
      ))}

      <style>{`
        .almanac-tier-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
        }
        @media (min-width: 480px) {
          .almanac-tier-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 700px) {
          .almanac-tier-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
          }
        }
        @media (min-width: 960px) {
          .almanac-tier-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1200px) {
          .almanac-tier-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)',
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
  completion: {
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--color-text-muted)',
    background: 'var(--color-bg-warm)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
  },
  tierSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tierHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tierDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  tierTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
    whiteSpace: 'nowrap',
  },
  tierLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(74, 55, 40, 0.1)',
  },
  tierGrid: {
    width: '100%',
  },
};

export default AlmanacPage;
