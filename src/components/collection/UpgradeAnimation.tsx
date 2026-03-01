import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { STAR_BENEFITS } from '../../config/starBenefits';

interface UpgradeAnimationProps {
  newRank: number;
  rarityColor: string;
  onComplete: () => void;
}

/**
 * UpgradeAnimation — Celebration overlay shown when a bao ranks up.
 * Flash of light, confetti burst, flying star, benefit text reveal.
 */
const UpgradeAnimation: React.FC<UpgradeAnimationProps> = ({ newRank, rarityColor, onComplete }) => {
  const [phase, setPhase] = useState<'flash' | 'celebrate' | 'text' | 'done'>('flash');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Phase 1: Flash (0-400ms)
    timerRef.current = setTimeout(() => {
      setPhase('celebrate');

      // Fire confetti burst
      const colors = [rarityColor, '#fbbf24', '#ffffff'];
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors,
        startVelocity: 25,
        gravity: 0.8,
        ticks: 80,
        shapes: ['star', 'circle'],
        scalar: 0.8,
      });

      // Phase 2: Celebrate → Text (800ms later)
      timerRef.current = setTimeout(() => {
        setPhase('text');

        // Phase 3: Text → Done (1800ms later)
        timerRef.current = setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 1800);
      }, 800);
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rarityColor, onComplete]);

  const benefit = STAR_BENEFITS[newRank - 1];

  return (
    <div className="upgrade-anim-overlay" style={styles.overlay}>
      {/* Flash */}
      {phase === 'flash' && (
        <div className="upgrade-flash" style={{
          ...styles.flash,
          background: `radial-gradient(circle, ${rarityColor}80 0%, transparent 70%)`,
        }} />
      )}

      {/* Flying star */}
      {(phase === 'flash' || phase === 'celebrate') && (
        <div className="upgrade-star-fly" style={styles.starContainer}>
          <span className="upgrade-flying-star" style={styles.flyingStar}>★</span>
        </div>
      )}

      {/* Benefit text */}
      {phase === 'text' && benefit && (
        <div className="upgrade-benefit-reveal" style={styles.benefitContainer}>
          <div style={styles.newStars}>
            {'★'.repeat(newRank)}
          </div>
          <div style={styles.benefitLabel}>{benefit.label} Unlocked!</div>
          <div style={styles.benefitDesc}>{benefit.description}</div>
        </div>
      )}

      <style>{`
        .upgrade-anim-overlay {
          animation: upgradeOverlayIn 0.3s ease-out;
        }
        @keyframes upgradeOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .upgrade-flash {
          animation: upgradeFlash 0.4s ease-out forwards;
        }
        @keyframes upgradeFlash {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        .upgrade-flying-star {
          animation: starFly 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes starFly {
          0% { transform: translateY(60px) scale(0.3); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(-20px) scale(1.5); opacity: 0.9; }
        }
        .upgrade-benefit-reveal {
          animation: benefitReveal 0.5s ease-out forwards;
        }
        @keyframes benefitReveal {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    pointerEvents: 'none',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  flash: {
    position: 'absolute',
    inset: '-20%',
    borderRadius: '50%',
  },
  starContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flyingStar: {
    fontSize: '48px',
    color: '#fbbf24',
    textShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
  },
  benefitContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '16px 24px',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  newStars: {
    fontSize: '24px',
    color: '#fbbf24',
    letterSpacing: '4px',
  },
  benefitLabel: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
    textAlign: 'center',
  },
  benefitDesc: {
    fontSize: '13px',
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
    textAlign: 'center',
  },
};

export default UpgradeAnimation;
