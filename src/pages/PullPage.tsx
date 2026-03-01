import React, { useMemo, useState, useEffect } from 'react';
import { Player, PullResult, Rarity, BaoId, SINGLE_PULL_COST, MULTI_PULL_COST } from '../types';
import { getBaoById } from '../config/baoData';
import { RARITY_CONFIG } from '../utils/rarity';
import BaoSteamer from '../components/bao/BaoSteamer';
import BaoArt from '../components/bao/BaoArt';
import PullAnimation from '../components/pull/PullAnimation';
import ParticleEffects from '../components/pull/ParticleEffects';
import CardFan from '../components/collection/CardFan';
import CollectionGrid from '../components/collection/CollectionGrid';
import BaoDetailModal from '../components/collection/BaoDetailModal';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

interface PullPageProps {
  player: Player;
  pulling: boolean;
  pullResults: PullResult[];
  showResults: boolean;
  animationRarity: Rarity;
  animationActive: boolean;
  pullSingle: () => void;
  pullMulti: () => void;
  dismissResults: () => void;
  onAnimationComplete: () => void;
  onUpgrade: (baoId: BaoId) => void;
}

const RARITY_ORDER = [Rarity.Common, Rarity.Uncommon, Rarity.Rare, Rarity.Epic, Rarity.Legendary];

const PullPage: React.FC<PullPageProps> = ({
  player,
  pulling,
  pullResults,
  showResults,
  animationRarity,
  animationActive,
  pullSingle,
  pullMulti,
  dismissResults,
  onAnimationComplete,
  onUpgrade,
}) => {
  const canPullSingle = player.tokens >= SINGLE_PULL_COST && !pulling;
  const canPullMulti = player.tokens >= MULTI_PULL_COST && !pulling;
  const isMulti = pullResults.length > 1;

  // View mode for multi-pull results (default fan on mobile)
  const [resultsView, setResultsView] = useState<'fan' | 'grid'>('fan');

  // Detail modal for inspecting a pulled bao
  const [detailBaoId, setDetailBaoId] = useState<BaoId | null>(null);
  const detailBao = detailBaoId ? (() => {
    try { return getBaoById(detailBaoId); } catch { return null; }
  })() : null;
  const detailOwned = detailBaoId ? player.collection[detailBaoId] : undefined;

  // Reset view on new pull
  useEffect(() => {
    if (showResults) setResultsView('fan');
  }, [showResults]);

  // Find highest rarity bao for reveal animation
  const revealBao = useMemo(() => {
    if (pullResults.length === 0) return undefined;
    let highest = pullResults[0];
    for (const result of pullResults) {
      if (RARITY_ORDER.indexOf(result.rarity) > RARITY_ORDER.indexOf(highest.rarity)) {
        highest = result;
      }
    }
    try {
      return getBaoById(highest.baoId);
    } catch {
      return undefined;
    }
  }, [pullResults]);

  // Check if multi-pull has Epic+ results for confetti
  const hasEpicPlus = useMemo(() => {
    return isMulti && pullResults.some(r =>
      r.rarity === Rarity.Epic || r.rarity === Rarity.Legendary
    );
  }, [isMulti, pullResults]);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (showResults && hasEpicPlus) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showResults, hasEpicPlus]);

  // Multi-pull items - sort by rarity (highest first)
  const multiPullItems = useMemo(() => {
    if (!isMulti) return [];
    const items = pullResults.map((result) => {
      try {
        const bao = getBaoById(result.baoId);
        return { bao, owned: player.collection[result.baoId], result };
      } catch {
        return null;
      }
    }).filter(Boolean) as Array<{ bao: any; owned?: any; result: PullResult }>;

    // Sort: highest rarity first
    items.sort((a, b) => {
      const aOrder = RARITY_ORDER.indexOf(a.result.rarity);
      const bOrder = RARITY_ORDER.indexOf(b.result.rarity);
      return bOrder - aOrder;
    });

    return items;
  }, [isMulti, pullResults, player.collection]);

  // Fan items (just bao + owned, without result)
  const multiPullFanItems = useMemo(() => {
    return multiPullItems.map(({ bao, owned }) => ({ bao, owned }));
  }, [multiPullItems]);

  // Grid items
  const multiPullGridItems = useMemo(() => {
    return multiPullItems.map(({ bao, owned }) => ({ bao, owned }));
  }, [multiPullItems]);

  const wobbleIntensity = pulling ? 'intense' : 'normal';

  return (
    <div style={styles.page}>
      {/* Pull Animation Overlay */}
      <PullAnimation
        isActive={animationActive}
        rarity={animationRarity}
        onComplete={onAnimationComplete}
        revealBao={revealBao}
      />

      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          <ParticleEffects type="confetti" count={30} active={true} />
        </div>
      )}

      {/* Main content */}
      <div style={styles.content}>
        <div style={styles.steamerArea}>
          <BaoSteamer
            size={220}
            isShaking={pulling}
            isOpen={showResults}
            wobbleIntensity={wobbleIntensity as 'normal' | 'intense'}
          />
        </div>

        <div style={styles.pityRow}>
          <span style={styles.pityText}>
            Epic pity: {player.pity.pullsSinceEpic}/40
          </span>
          <span style={styles.pityDot} />
          <span style={styles.pityText}>
            Legendary pity: {player.pity.pullsSinceLegendary}/90
          </span>
        </div>

        <div style={styles.buttonRow}>
          <Button
            variant="primary"
            tokenCost={SINGLE_PULL_COST}
            disabled={!canPullSingle}
            onClick={pullSingle}
            style={{ flex: 1 }}
          >
            Pull 1x
          </Button>
          <Button
            variant="special"
            tokenCost={MULTI_PULL_COST}
            disabled={!canPullMulti}
            onClick={pullMulti}
            style={{ flex: 1 }}
          >
            Pull 10x
          </Button>
        </div>

        <p style={styles.statsText}>
          Total pulls: {player.totalPulls}
        </p>
      </div>

      {/* Results modal */}
      <Modal
        isOpen={showResults && pullResults.length > 0}
        onClose={dismissResults}
        title={isMulti ? 'Pull Results (10x)' : 'Pull Result'}
      >
        {isMulti ? (
          <div style={styles.multiResults}>
            {/* View toggle */}
            <div className="view-toggle" style={{ alignSelf: 'center', marginBottom: '8px' }}>
              <button
                className={`view-toggle-btn${resultsView === 'fan' ? ' active' : ''}`}
                onClick={() => setResultsView('fan')}
              >
                Fan
              </button>
              <button
                className={`view-toggle-btn${resultsView === 'grid' ? ' active' : ''}`}
                onClick={() => setResultsView('grid')}
              >
                Grid
              </button>
            </div>

            {resultsView === 'fan' ? (
              <CardFan
                items={multiPullFanItems}
                onCardClick={(baoId) => setDetailBaoId(baoId)}
                size="sm"
                coverflow
              />
            ) : (
              <CollectionGrid
                items={multiPullGridItems}
                onCardClick={(baoId) => setDetailBaoId(baoId)}
              />
            )}
          </div>
        ) : (
          <div style={styles.resultsSingle}>
            {pullResults.map((result, index) => (
              <ResultCard key={`${result.baoId}-${index}`} result={result} onClick={() => setDetailBaoId(result.baoId)} />
            ))}
          </div>
        )}
        <div style={styles.dismissRow}>
          <Button variant="primary" onClick={dismissResults} style={{ width: '100%' }}>
            {isMulti ? 'Collect All' : 'Continue'}
          </Button>
        </div>
      </Modal>
      {/* Detail modal for inspecting a pulled bao */}
      {detailBao && (
        <BaoDetailModal
          bao={detailBao}
          owned={detailOwned}
          isOpen={!!detailBaoId}
          onClose={() => setDetailBaoId(null)}
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
};

// ---- Result Card sub-component ----

const ResultCard: React.FC<{ result: PullResult; onClick?: () => void }> = ({ result, onClick }) => {
  const bao = getBaoById(result.baoId);
  const rarityConf = RARITY_CONFIG[result.rarity];

  return (
    <div
      style={{
        ...styles.card,
        background: rarityConf.bgColor,
        borderColor: rarityConf.color,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {result.isNew && <div style={styles.newBadge}>NEW!</div>}

      <BaoArt
        baoId={bao.id}
        baseColor={bao.baseColor}
        accentColor={bao.accentColor}
        pattern={bao.pattern}
        faceExpression={bao.faceExpression}
        rank={0}
        size={80}
      />

      <span style={styles.cardName}>{bao.name}</span>

      <span
        style={{
          ...styles.rarityBadge,
          color: rarityConf.color,
          background: `${rarityConf.color}18`,
          borderColor: `${rarityConf.color}40`,
        }}
      >
        {rarityConf.label}
      </span>

      {result.isDuplicate && (
        <span style={styles.dupeText}>x{result.newCount}</span>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    padding: '16px',
    position: 'relative',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
    flex: 1,
    justifyContent: 'center',
    gap: '12px',
  },
  steamerArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  pityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
  },
  pityText: {
    fontSize: '12px',
    color: '#8b7565',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
  },
  pityDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#d4c4b4',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginTop: '8px',
  },
  statsText: {
    fontSize: '12px',
    color: '#b8a99a',
    fontFamily: 'var(--font-body)',
    margin: '4px 0 0',
  },

  // Results
  multiResults: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  resultsSingle: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 8px',
    borderRadius: '14px',
    border: '2px solid',
    position: 'relative',
    animation: 'bounceIn 0.4s ease-out',
    minWidth: '110px',
  },
  newBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: '#f97356',
    color: 'white',
    fontSize: '10px',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '9999px',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 2px 6px rgba(249, 115, 86, 0.3)',
    letterSpacing: '0.5px',
  },
  cardName: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#4a3728',
    fontFamily: 'var(--font-body)',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  rarityBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '9999px',
    border: '1px solid',
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.3px',
  },
  dupeText: {
    fontSize: '11px',
    color: '#8b7565',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
  },
  dismissRow: {
    marginTop: '4px',
  },
};

export default PullPage;
