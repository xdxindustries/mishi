import React, { useState, useEffect, useCallback } from 'react';
import { Rarity, BaoDefinition } from '../../types';
import { RARITY_CONFIG } from '../../utils/rarity';
import BaoArt from '../bao/BaoArt';
import ParticleEffects from './ParticleEffects';
import LightRays from './LightRays';
import SpeedLines from './SpeedLines';
import ImpactFrame from './ImpactFrame';
import RingBurst from './RingBurst';
import { useConfetti } from '../../hooks/useConfetti';

interface PullAnimationProps {
  isActive: boolean;
  rarity: Rarity;
  onComplete: () => void;
  revealBao?: BaoDefinition;
}

type Phase = 'idle' | 'anticipation' | 'burst' | 'flash' | 'glow' | 'cardReveal' | 'settle' | 'done';

const RARITY_GLOW_COLOR: Record<Rarity, string> = {
  [Rarity.Common]: 'rgba(226, 224, 221, 0.6)',
  [Rarity.Uncommon]: 'rgba(74, 222, 128, 0.6)',
  [Rarity.Rare]: 'rgba(96, 165, 250, 0.65)',
  [Rarity.Epic]: 'rgba(168, 85, 247, 0.7)',
  [Rarity.Legendary]: 'rgba(251, 191, 36, 0.75)',
};

const RARITY_GLOW_SOLID: Record<Rarity, string> = {
  [Rarity.Common]: '#e2e0dd',
  [Rarity.Uncommon]: '#4ade80',
  [Rarity.Rare]: '#60a5fa',
  [Rarity.Epic]: '#a855f7',
  [Rarity.Legendary]: '#fbbf24',
};

const RARITY_PARTICLE_COUNT: Record<Rarity, number> = {
  [Rarity.Common]: 10,
  [Rarity.Uncommon]: 16,
  [Rarity.Rare]: 22,
  [Rarity.Epic]: 30,
  [Rarity.Legendary]: 40,
};

const RARITY_RAY_COUNT: Record<Rarity, number> = {
  [Rarity.Common]: 0,
  [Rarity.Uncommon]: 6,
  [Rarity.Rare]: 10,
  [Rarity.Epic]: 14,
  [Rarity.Legendary]: 18,
};

const RARITY_RING_COUNT: Record<Rarity, number> = {
  [Rarity.Common]: 1,
  [Rarity.Uncommon]: 2,
  [Rarity.Rare]: 2,
  [Rarity.Epic]: 3,
  [Rarity.Legendary]: 4,
};

// Idle animation to play after the bao lands from its cheer jump
const RARITY_REVEAL_IDLE: Record<Rarity, 'breath' | 'hop' | 'wiggle' | 'cheer' | 'none'> = {
  [Rarity.Common]: 'breath',
  [Rarity.Uncommon]: 'hop',
  [Rarity.Rare]: 'cheer',
  [Rarity.Epic]: 'wiggle',
  [Rarity.Legendary]: 'cheer',
};

/**
 * PullAnimation — Full-screen overlay for the bao reveal sequence.
 *
 * 7-phase animation with anime-style VFX:
 * - anticipation (0-1200ms): Converging speed lines + pulsing energy orb
 * - burst (1200-1500ms): Canvas confetti explosion + ring burst + DOM particles
 * - flash (1500-1750ms): Impact frame starburst + screen flash + rarity effects
 * - glow (1750-2800ms): Upgraded light rays + radial speed lines + particle shower
 * - cardReveal (2800-3400ms): Card entry, bao sits on card
 * - settle (3400-5400ms): Bao jumps off card with slime cheer + sparkle dust
 * - done: calls onComplete
 *
 * Legendary extends timing by ~800ms.
 */
const PullAnimation: React.FC<PullAnimationProps> = ({ isActive, rarity, onComplete, revealBao }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const { fireBurst, fireShower, fireCelebration } = useConfetti();

  const isLegendary = rarity === Rarity.Legendary;
  const isEpic = rarity === Rarity.Epic;

  const runSequence = useCallback(() => {
    setPhase('anticipation');

    const glowExtra = isLegendary ? 800 : 0;

    const t1 = setTimeout(() => setPhase('burst'), 1200);
    const t2 = setTimeout(() => setPhase('flash'), 1500);
    const t3 = setTimeout(() => setPhase('glow'), 1750);
    const t4 = setTimeout(() => setPhase('cardReveal'), 2800 + glowExtra);
    const t5 = setTimeout(() => setPhase('settle'), 3400 + glowExtra);
    const t6 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 5400 + glowExtra);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete, isLegendary]);

  useEffect(() => {
    if (isActive) {
      const cleanup = runSequence();
      return cleanup;
    } else {
      setPhase('idle');
    }
  }, [isActive, runSequence]);

  // Legendary screen shake
  useEffect(() => {
    if (phase === 'burst' && rarity === Rarity.Legendary) {
      document.body.classList.add('screen-shake');
      const t = setTimeout(() => document.body.classList.remove('screen-shake'), 500);
      return () => {
        clearTimeout(t);
        document.body.classList.remove('screen-shake');
      };
    }
  }, [phase, rarity]);

  // Fire canvas confetti on burst phase
  useEffect(() => {
    if (phase === 'burst') {
      fireBurst(RARITY_GLOW_SOLID[rarity], RARITY_PARTICLE_COUNT[rarity]);
    }
  }, [phase, rarity, fireBurst]);

  // Fire confetti shower during glow
  useEffect(() => {
    if (phase === 'glow') {
      fireShower(RARITY_GLOW_SOLID[rarity], Math.floor(RARITY_PARTICLE_COUNT[rarity] / 2));
    }
  }, [phase, rarity, fireShower]);

  // Fire celebration confetti on settle for epic+
  useEffect(() => {
    if (phase === 'settle' && (rarity === Rarity.Epic || rarity === Rarity.Legendary)) {
      fireCelebration(RARITY_GLOW_SOLID[rarity]);
    }
  }, [phase, rarity, fireCelebration]);

  if (!isActive && phase === 'idle') return null;

  const glowColor = RARITY_GLOW_COLOR[rarity];
  const glowSolid = RARITY_GLOW_SOLID[rarity];
  const particleCount = RARITY_PARTICLE_COUNT[rarity];
  const rayCount = RARITY_RAY_COUNT[rarity];
  const ringCount = RARITY_RING_COUNT[rarity];
  const rarityConfig = RARITY_CONFIG[rarity];

  return (
    <div className="pull-animation-overlay" style={styles.overlay}>
      {/* Backdrop */}
      <div
        style={{
          ...styles.backdrop,
          opacity: phase === 'idle' ? 0 : 1,
          backgroundColor:
            phase === 'flash'
              ? isLegendary
                ? 'rgba(251, 191, 36, 0.6)'
                : isEpic
                ? 'rgba(168, 85, 247, 0.5)'
                : 'rgba(255, 255, 255, 0.5)'
              : phase === 'glow' || phase === 'cardReveal' || phase === 'settle'
              ? glowColor
              : 'rgba(0,0,0,0.7)',
          transition: 'background-color 0.3s ease, opacity 0.3s ease',
        }}
      />

      {/* Phase: anticipation — converging speed lines + energy orb */}
      {phase === 'anticipation' && (
        <div style={styles.center}>
          <SpeedLines
            color={glowSolid}
            lineCount={24}
            variant="converging"
            active={true}
          />
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `radial-gradient(circle, white 0%, ${glowSolid} 30%, transparent 70%)`,
              animation: 'pulse 0.4s ease-in-out infinite',
              opacity: 0.8,
              boxShadow: `0 0 40px ${glowSolid}80, 0 0 80px ${glowSolid}40`,
            }}
          />
        </div>
      )}

      {/* Phase: burst — particle explosion + ring burst */}
      {phase === 'burst' && (
        <div style={styles.center}>
          <ParticleEffects
            type="burst"
            count={particleCount}
            color={glowSolid}
            active={true}
          />
          <RingBurst
            color={glowSolid}
            ringCount={ringCount}
            active={true}
          />
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: `radial-gradient(circle, white 0%, ${glowSolid} 30%, transparent 60%)`,
              animation: 'lightBurst 0.5s ease-out forwards',
              boxShadow: `0 0 60px ${glowSolid}`,
            }}
          />
        </div>
      )}

      {/* Phase: flash — impact frame + screen flash */}
      {phase === 'flash' && (
        <>
          <div
            className="pull-screen-flash"
            style={{ background: isLegendary ? 'rgba(251, 191, 36, 0.8)' : isEpic ? 'rgba(168, 85, 247, 0.6)' : 'white' }}
          />
          <ImpactFrame
            color={glowSolid}
            rarity={rarity}
            active={true}
          />
          {/* Epic: lightning flash */}
          {isEpic && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10001,
                pointerEvents: 'none',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), transparent, rgba(168, 85, 247, 0.2))',
                animation: 'lightningFlash 0.4s ease-out forwards',
              }}
            />
          )}
          {/* Legendary: golden wash */}
          {isLegendary && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10001,
                pointerEvents: 'none',
                background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.5), rgba(253, 211, 77, 0.3), transparent)',
                animation: 'goldenWash 0.6s ease-out forwards',
              }}
            />
          )}
        </>
      )}

      {/* Phase: glow — upgraded light rays + speed lines + particle shower */}
      {(phase === 'glow' || phase === 'cardReveal' || phase === 'settle') && (
        <div style={styles.center}>
          {/* Radial gradient glow with box-shadow */}
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: `radial-gradient(circle, white 0%, ${glowSolid}80 20%, ${glowColor} 50%, transparent 70%)`,
              animation: 'bounceIn 0.5s ease-out forwards',
              position: 'absolute',
              boxShadow: `0 0 80px ${glowSolid}60, 0 0 120px ${glowColor}`,
            }}
          />
          {/* Radial speed lines behind light rays */}
          {phase === 'glow' && (
            <SpeedLines
              color={glowSolid}
              lineCount={20}
              variant="radial"
              active={true}
            />
          )}
          {/* Upgraded light rays */}
          {rayCount > 0 && (
            <LightRays
              color={glowSolid}
              rayCount={rayCount}
              spinning={true}
            />
          )}
          {/* DOM particle shower */}
          {phase === 'glow' && (
            <ParticleEffects
              type="shower"
              count={Math.floor(particleCount / 2)}
              color={glowSolid}
              active={true}
            />
          )}
        </div>
      )}

      {/* Phase: cardReveal + settle — Card stays still, Bao jumps independently */}
      {(phase === 'cardReveal' || phase === 'settle') && revealBao && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: phase === 'cardReveal' ? 'cardRevealEntry 0.5s var(--ease-bounce) forwards' : undefined,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Card container — stays still, overflow visible so bao can jump past border */}
            <div style={{ position: 'relative', overflow: 'visible' }}>
              {/* The card itself */}
              <div
                style={{
                  padding: '16px',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}40`,
                  animation: phase === 'settle' ? 'rarityPulse 2s ease-in-out infinite' : undefined,
                  '--rarity-glow': glowColor,
                  position: 'relative',
                  zIndex: 1,
                } as React.CSSProperties}
              >
                {/* Invisible placeholder to maintain card height where bao would be */}
                <div style={{ width: 120, height: 102, visibility: 'hidden' }} />
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '8px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: rarityConfig.color,
                  }}
                >
                  {revealBao.name}
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: rarityConfig.color,
                    opacity: 0.8,
                    marginTop: '2px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {rarityConfig.label}
                </div>
              </div>

              {/* Bao — positioned absolutely on top of the card, jumps independently */}
              <div
                style={{
                  position: 'absolute',
                  top: 16, // matches card padding
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                  animation: phase === 'settle'
                    ? 'baoCheerJump 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                    : undefined,
                  transformOrigin: 'center bottom',
                }}
              >
                <BaoArt
                  baoId={revealBao.id}
                  baseColor={revealBao.baseColor}
                  accentColor={revealBao.accentColor}
                  pattern={revealBao.pattern}
                  faceExpression={revealBao.faceExpression}
                  rank={0}
                  size={120}
                  idleAnimation={phase === 'settle' ? RARITY_REVEAL_IDLE[rarity] : 'none'}
                  revealMode={true}
                  artUrl={revealBao.revealArtUrl || revealBao.artUrl}
                />
              </div>

              {/* Small shadow under bao on card surface */}
              <div
                style={{
                  position: 'absolute',
                  top: 100, // below bao position
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 8,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(74, 55, 40, 0.1) 0%, transparent 70%)',
                  zIndex: 1,
                  animation: phase === 'settle'
                    ? 'baoShadow 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                    : undefined,
                  transformOrigin: 'center center',
                }}
              />
            </div>

            {/* Legendary energy wave behind card */}
            {isLegendary && phase === 'settle' && (
              <div
                style={{
                  position: 'absolute',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: `2px solid ${glowSolid}`,
                  animation: 'energyWave 1.5s ease-out forwards',
                  '--wave-color': glowSolid,
                  pointerEvents: 'none',
                  zIndex: 0,
                } as React.CSSProperties}
              />
            )}
          </div>
        </div>
      )}

      {/* Phase: settle — sparkle dust */}
      {phase === 'settle' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 11, pointerEvents: 'none' }}>
          <ParticleEffects
            type="sparkleDust"
            count={12}
            color={glowSolid}
            active={true}
          />
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'auto',
  },
  center: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 400,
    height: 400,
  },
};

export default PullAnimation;
