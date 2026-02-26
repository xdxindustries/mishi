import React from 'react';
import { Player, PullResult, Rarity, SINGLE_PULL_COST, MULTI_PULL_COST } from '../types';
import { getBaoById } from '../config/baoData';
import { RARITY_CONFIG } from '../utils/rarity';
import BaoSteamer from '../components/bao/BaoSteamer';
import BaoArt from '../components/bao/BaoArt';
import PullAnimation from '../components/pull/PullAnimation';
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
}

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
}) => {
  const canPullSingle = player.tokens >= SINGLE_PULL_COST && !pulling;
  const canPullMulti = player.tokens >= MULTI_PULL_COST && !pulling;
  const isMulti = pullResults.length > 1;

  return (
    <div style={styles.page}>
      {/* Pull Animation Overlay */}
      <PullAnimation
        isActive={animationActive}
        rarity={animationRarity}
        onComplete={onAnimationComplete}
      />

      {/* Main content */}
      <div style={styles.content}>
        {/* Steamer */}
        <div style={styles.steamerArea}>
          <BaoSteamer
            size={220}
            isShaking={pulling}
            isOpen={showResults}
          />
        </div>

        {/* Pity counters */}
        <div style={styles.pityRow}>
          <span style={styles.pityText}>
            Epic pity: {player.pity.pullsSinceEpic}/40
          </span>
          <span style={styles.pityDot} />
          <span style={styles.pityText}>
            Legendary pity: {player.pity.pullsSinceLegendary}/90
          </span>
        </div>

        {/* Pull buttons */}
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

        {/* Total pulls stat */}
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
        <div style={isMulti ? styles.resultsGrid : styles.resultsSingle}>
          {pullResults.map((result, index) => (
            <ResultCard key={`${result.baoId}-${index}`} result={result} />
          ))}
        </div>
        <div style={styles.dismissRow}>
          <Button variant="primary" onClick={dismissResults} style={{ width: '100%' }}>
            {isMulti ? 'Collect All' : 'Continue'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// ---- Result Card sub-component ----

const ResultCard: React.FC<{ result: PullResult }> = ({ result }) => {
  const bao = getBaoById(result.baoId);
  const rarityConf = RARITY_CONFIG[result.rarity];

  return (
    <div
      style={{
        ...styles.card,
        background: rarityConf.bgColor,
        borderColor: rarityConf.color,
      }}
    >
      {/* NEW badge */}
      {result.isNew && <div style={styles.newBadge}>NEW!</div>}

      {/* Bao art */}
      <BaoArt
        baoId={bao.id}
        baseColor={bao.baseColor}
        accentColor={bao.accentColor}
        pattern={bao.pattern}
        faceExpression={bao.faceExpression}
        rank={0}
        size={80}
      />

      {/* Name */}
      <span style={styles.cardName}>{bao.name}</span>

      {/* Rarity badge */}
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

      {/* Dupe count */}
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
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    marginBottom: '16px',
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
