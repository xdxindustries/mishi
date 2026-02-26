import React, { useState, useEffect, useCallback } from 'react';
import { Rarity } from '../../types';

interface PullAnimationProps {
  isActive: boolean;
  rarity: Rarity;
  onComplete: () => void;
}

type Phase = 'idle' | 'steam' | 'lift' | 'glow' | 'done';

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

/**
 * PullAnimation — Full-screen overlay for the bao reveal sequence.
 *
 * Phase 1 (0-800ms): Steam wisps rising
 * Phase 2 (800-1400ms): Lid lifts up
 * Phase 3 (1400-1800ms): Rarity-colored glow burst
 * Phase 4 (1800ms+): Calls onComplete
 *
 * Legendary pulls trigger a screen shake effect.
 */
const PullAnimation: React.FC<PullAnimationProps> = ({ isActive, rarity, onComplete }) => {
  const [phase, setPhase] = useState<Phase>('idle');

  const runSequence = useCallback(() => {
    setPhase('steam');

    const t1 = setTimeout(() => setPhase('lift'), 800);
    const t2 = setTimeout(() => setPhase('glow'), 1400);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

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
    if (phase === 'glow' && rarity === Rarity.Legendary) {
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

  return (
    <div className="pull-animation-overlay" style={styles.overlay}>
      {/* Backdrop */}
      <div
        style={{
          ...styles.backdrop,
          opacity: phase === 'idle' ? 0 : 1,
          backgroundColor: phase === 'glow' ? glowColor : 'rgba(0,0,0,0.5)',
          transition: 'background-color 0.4s ease, opacity 0.3s ease',
        }}
      />

      {/* Steam wisps — Phase 1 */}
      {(phase === 'steam' || phase === 'lift') && (
        <div style={styles.steamContainer}>
          <svg width="300" height="200" viewBox="0 0 300 200" style={{ position: 'absolute', bottom: 0 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={i}
                cx={80 + i * 40}
                cy={180}
                rx={10 + i * 2}
                ry={15 + i * 3}
                fill="white"
                opacity="0"
              >
                <animate
                  attributeName="cy"
                  values={`${180};${80 - i * 10};${20}`}
                  dur={`${2 + i * 0.3}s`}
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.4;0"
                  dur={`${2 + i * 0.3}s`}
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="rx"
                  values={`${8 + i};${14 + i * 2};${20 + i * 3}`}
                  dur={`${2 + i * 0.3}s`}
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </ellipse>
            ))}
          </svg>
        </div>
      )}

      {/* Lid lift — Phase 2 */}
      {(phase === 'lift' || phase === 'glow') && (
        <div
          style={{
            ...styles.lidContainer,
            animation: phase === 'lift' ? 'lidLift 0.6s ease-out forwards' : undefined,
            transform: phase === 'glow' ? 'translateY(-60px) rotate(-15deg)' : undefined,
            opacity: phase === 'glow' ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          <svg width="160" height="50" viewBox="0 0 160 50">
            <defs>
              <linearGradient id="pull-lid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8c99b" />
                <stop offset="100%" stopColor="#d4a574" />
              </linearGradient>
            </defs>
            <path d="M5 45 Q5 20 80 10 Q155 20 155 45" fill="url(#pull-lid-grad)" />
            <ellipse cx="80" cy="45" rx="75" ry="8" fill="#d4a574" />
            <ellipse cx="80" cy="13" rx="10" ry="4" fill="#c4955e" />
            <ellipse cx="80" cy="12" rx="7" ry="2.5" fill="#deb887" />
          </svg>
        </div>
      )}

      {/* Glow burst — Phase 3 */}
      {phase === 'glow' && (
        <div style={styles.glowContainer}>
          {/* Central glow */}
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glowSolid} 0%, ${glowColor} 40%, transparent 70%)`,
              animation: 'bounceIn 0.5s ease-out forwards',
            }}
          />
          {/* Rarity-specific rays */}
          {rarity === Rarity.Legendary && (
            <div style={styles.rays}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 3,
                    height: 80,
                    background: `linear-gradient(to top, ${glowSolid}, transparent)`,
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'bottom center',
                    transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                    opacity: 0.5,
                    animation: `fadeIn 0.3s ease-out ${i * 0.05}s forwards`,
                  }}
                />
              ))}
            </div>
          )}
          {rarity === Rarity.Epic && (
            <div style={styles.rays}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 2,
                    height: 50,
                    background: `linear-gradient(to top, ${glowSolid}, transparent)`,
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'bottom center',
                    transform: `translate(-50%, -100%) rotate(${i * 60}deg)`,
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
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
  steamContainer: {
    position: 'absolute',
    bottom: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 300,
    height: 200,
    zIndex: 1,
  },
  lidContainer: {
    position: 'relative',
    zIndex: 2,
  },
  glowContainer: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rays: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
};

export default PullAnimation;
