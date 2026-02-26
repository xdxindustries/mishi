import React, { useState, useEffect, useCallback } from 'react';
import { Rarity, BaoDefinition } from '../../types';
import { RARITY_CONFIG } from '../../utils/rarity';
import BaoArt from '../bao/BaoArt';
import ParticleEffects from './ParticleEffects';
import LightRays from './LightRays';

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
  [Rarity.Common]: 8,
  [Rarity.Uncommon]: 12,
  [Rarity.Rare]: 18,
  [Rarity.Epic]: 24,
  [Rarity.Legendary]: 30,
};

const RARITY_RAY_COUNT: Record<Rarity, number> = {
  [Rarity.Common]: 0,
  [Rarity.Uncommon]: 4,
  [Rarity.Rare]: 8,
  [Rarity.Epic]: 10,
  [Rarity.Legendary]: 12,
};

/**
 * PullAnimation — Full-screen overlay for the bao reveal sequence.
 *
 * 6-phase animation:
 * - anticipation (0-1000ms): Steamer glow crack at center, escalating tension
 * - burst (1000-1400ms): Particle burst explosion
 * - flash (1400-1600ms): Screen flash + rarity-specific effects
 * - glow (1600-2400ms): LightRays + particle shower + radial gradient
 * - cardReveal (2400-2900ms): BaoArt with cardRevealEntry animation
 * - settle (2900-3500ms): Sparkle dust, rarity pulse
 * - done: calls onComplete
 *
 * Legendary extends timing by ~700ms.
 */
const PullAnimation: React.FC<PullAnimationProps> = ({ isActive, rarity, onComplete, revealBao }) => {
  const [phase, setPhase] = useState<Phase>('idle');

  const isLegendary = rarity === Rarity.Legendary;
  const isEpic = rarity === Rarity.Epic;

  const runSequence = useCallback(() => {
    setPhase('anticipation');

    const glowExtra = isLegendary ? 700 : 0;

    const t1 = setTimeout(() => setPhase('burst'), 1000);
    const t2 = setTimeout(() => setPhase('flash'), 1400);
    const t3 = setTimeout(() => setPhase('glow'), 1600);
    const t4 = setTimeout(() => setPhase('cardReveal'), 2400 + glowExtra);
    const t5 = setTimeout(() => setPhase('settle'), 2900 + glowExtra);
    const t6 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3500 + glowExtra);

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

  if (!isActive && phase === 'idle') return null;

  const glowColor = RARITY_GLOW_COLOR[rarity];
  const glowSolid = RARITY_GLOW_SOLID[rarity];
  const particleCount = RARITY_PARTICLE_COUNT[rarity];
  const rayCount = RARITY_RAY_COUNT[rarity];
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
              : 'rgba(0,0,0,0.6)',
          transition: 'background-color 0.3s ease, opacity 0.3s ease',
        }}
      />

      {/* Phase: anticipation — glowing crack at center */}
      {phase === 'anticipation' && (
        <div style={styles.center}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glowSolid} 0%, transparent 70%)`,
              animation: 'pulse 0.5s ease-in-out infinite',
              opacity: 0.7,
            }}
          />
        </div>
      )}

      {/* Phase: burst — particle explosion */}
      {phase === 'burst' && (
        <div style={styles.center}>
          <ParticleEffects
            type="burst"
            count={particleCount}
            color={glowSolid}
            active={true}
          />
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glowSolid} 0%, transparent 60%)`,
              animation: 'lightBurst 0.5s ease-out forwards',
            }}
          />
        </div>
      )}

      {/* Phase: flash — screen flash */}
      {phase === 'flash' && (
        <>
          <div
            className="pull-screen-flash"
            style={{ background: isLegendary ? 'rgba(251, 191, 36, 0.8)' : isEpic ? 'rgba(168, 85, 247, 0.6)' : 'white' }}
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

      {/* Phase: glow — light rays + particle shower */}
      {(phase === 'glow' || phase === 'cardReveal' || phase === 'settle') && (
        <div style={styles.center}>
          {/* Radial gradient glow */}
          <div
            style={{
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glowSolid} 0%, ${glowColor} 40%, transparent 70%)`,
              animation: 'bounceIn 0.5s ease-out forwards',
              position: 'absolute',
            }}
          />
          {/* Light rays */}
          {rayCount > 0 && (
            <LightRays
              color={glowSolid}
              rayCount={rayCount}
              spinning={true}
            />
          )}
          {/* Particle shower */}
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

      {/* Phase: cardReveal — BaoArt with entry animation */}
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
          <div
            style={{
              padding: '16px',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: `0 0 30px ${glowColor}`,
              animation: phase === 'settle' ? 'rarityPulse 2s ease-in-out infinite' : undefined,
              '--rarity-glow': glowColor,
            } as React.CSSProperties}
          >
            <BaoArt
              baoId={revealBao.id}
              baseColor={revealBao.baseColor}
              accentColor={revealBao.accentColor}
              pattern={revealBao.pattern}
              faceExpression={revealBao.faceExpression}
              rank={0}
              size={120}
            />
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
        </div>
      )}

      {/* Phase: settle — sparkle dust */}
      {phase === 'settle' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 11, pointerEvents: 'none' }}>
          <ParticleEffects
            type="sparkleDust"
            count={8}
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
    width: 300,
    height: 300,
  },
};

export default PullAnimation;
