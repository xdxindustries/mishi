import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue, animate } from 'framer-motion';
import { Rarity } from '../../types';
import { getShowcaseAnimations, ShowcaseAnimationId } from '../../config/showcaseAnimations';
import { useShowcaseAnimation } from './animations/useShowcaseAnimation';
import ShowcaseOverlay from './animations/showcaseOverlays';
import ShowcaseParticles from './animations/ShowcaseParticles';

type IdleAnimation = 'breath' | 'hop' | 'wiggle' | 'cheer' | 'none';

interface BaoArtProps {
  baoId: string;
  baseColor: string;
  accentColor: string;
  pattern: string;
  faceExpression: string;
  rank: number;
  size?: number;
  idleAnimation?: IdleAnimation;
  /** When true, renders special reveal-time effects: anime sparkle eyes for Mishi, legendary auras, etc. */
  revealMode?: boolean;
  /** When true, tapping triggers showcase animations instead of simple squish */
  showcaseMode?: boolean;
  /** Increment to trigger showcase animation externally */
  triggerShowcase?: number;
  /** Rarity needed to look up animation pool */
  rarity?: Rarity;
  /** Optional AI-generated art image URL — replaces the SVG bun when provided */
  artUrl?: string;
}

/**
 * BaoArt — The core SVG component that renders a kawaii steamed bun.
 * Uses framer-motion for springy squish physics and alive-feeling idle animations.
 */
const BaoArt: React.FC<BaoArtProps> = ({
  baoId,
  baseColor,
  accentColor,
  pattern,
  faceExpression,
  rank,
  size = 120,
  idleAnimation = 'breath',
  revealMode = false,
  showcaseMode = false,
  triggerShowcase = 0,
  rarity,
  artUrl,
}) => {
  const uid = useMemo(() => `bao-${baoId}-${Math.random().toString(36).slice(2, 8)}`, [baoId]);

  // ---- Squish physics ----
  const squishX = useMotionValue(1);
  const squishY = useMotionValue(1);
  const springX = useSpring(squishX, { stiffness: 300, damping: 15, mass: 0.8 });
  const springY = useSpring(squishY, { stiffness: 300, damping: 15, mass: 0.8 });
  const svgTransform = useTransform(
    [springX, springY],
    ([sx, sy]: number[]) => `scaleX(${sx}) scaleY(${sy})`
  );

  // Idle offset for breathing/bounce
  const idleY = useMotionValue(0);
  const springIdleY = useSpring(idleY, { stiffness: 120, damping: 14, mass: 1 });
  const idleRotate = useMotionValue(0);
  const springIdleRotate = useSpring(idleRotate, { stiffness: 100, damping: 12, mass: 0.6 });

  // Eye blink state
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Schedule random blinks
  useEffect(() => {
    if (faceExpression === 'sleepy' || faceExpression === 'bliss') return; // These have closed eyes
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      blinkTimer.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimer.current);
  }, [faceExpression]);

  // ---- Idle animation loop ----
  useEffect(() => {
    if (idleAnimation === 'none') return;
    let cancelled = false;

    const runIdle = async () => {
      while (!cancelled) {
        switch (idleAnimation) {
          case 'breath':
            // Gentle squish breathing
            squishX.set(1.03);
            squishY.set(0.97);
            await delay(1500);
            if (cancelled) return;
            squishX.set(0.98);
            squishY.set(1.02);
            await delay(1500);
            if (cancelled) return;
            squishX.set(1);
            squishY.set(1);
            await delay(800);
            break;

          case 'hop':
            // Anticipation squish down, then hop up
            squishX.set(1.06);
            squishY.set(0.92);
            await delay(250);
            if (cancelled) return;
            squishX.set(0.94);
            squishY.set(1.08);
            idleY.set(-8);
            await delay(300);
            if (cancelled) return;
            idleY.set(0);
            squishX.set(1.04);
            squishY.set(0.95);
            await delay(200);
            if (cancelled) return;
            squishX.set(1);
            squishY.set(1);
            await delay(1800 + Math.random() * 1000);
            break;

          case 'wiggle':
            // Side-to-side wiggle with squish
            idleRotate.set(-4);
            squishX.set(1.03);
            await delay(200);
            if (cancelled) return;
            idleRotate.set(4);
            squishX.set(0.97);
            await delay(200);
            if (cancelled) return;
            idleRotate.set(-2);
            squishX.set(1.01);
            await delay(150);
            if (cancelled) return;
            idleRotate.set(0);
            squishX.set(1);
            squishY.set(1);
            await delay(2000 + Math.random() * 1500);
            break;

          case 'cheer':
            // Excited bouncing with big squish
            squishX.set(1.08);
            squishY.set(0.88);
            await delay(150);
            if (cancelled) return;
            squishX.set(0.92);
            squishY.set(1.12);
            idleY.set(-10);
            await delay(200);
            if (cancelled) return;
            idleY.set(0);
            squishX.set(1.05);
            squishY.set(0.93);
            await delay(150);
            if (cancelled) return;
            squishX.set(0.96);
            squishY.set(1.06);
            idleY.set(-5);
            await delay(200);
            if (cancelled) return;
            idleY.set(0);
            squishX.set(1);
            squishY.set(1);
            await delay(1500 + Math.random() * 1000);
            break;
        }
      }
    };

    runIdle();
    return () => { cancelled = true; };
  }, [idleAnimation, squishX, squishY, idleY, idleRotate]);

  // ---- Showcase animation system ----
  const [showcaseActive, setShowcaseActive] = useState(false);
  const [showcaseAnimId, setShowcaseAnimId] = useState<ShowcaseAnimationId | null>(null);
  const [showcaseFaceOverride, setShowcaseFaceOverride] = useState<'megaPuppy' | 'wink' | null>(null);
  const showcaseCycleRef = useRef(0);

  const triggerShowcaseAnim = useCallback(() => {
    if (showcaseActive || !rarity) return;
    const anims = getShowcaseAnimations(baoId, rarity);
    const idx = showcaseCycleRef.current % anims.length;
    showcaseCycleRef.current++;
    const animId = anims[idx].id;
    setShowcaseAnimId(animId);
    setShowcaseActive(true);
    if (animId === 'megaPuppyEyes') setShowcaseFaceOverride('megaPuppy');
    else if (animId === 'mishiWink') setShowcaseFaceOverride('wink');
    else setShowcaseFaceOverride(null);
  }, [showcaseActive, rarity, baoId]);

  const handleShowcaseComplete = useCallback(() => {
    setShowcaseActive(false);
    setShowcaseAnimId(null);
    setShowcaseFaceOverride(null);
  }, []);

  useShowcaseAnimation({
    motionValues: { squishX, squishY, idleY, idleRotate },
    animationId: showcaseAnimId,
    onComplete: handleShowcaseComplete,
  });

  // External trigger via prop changes
  useEffect(() => {
    if (triggerShowcase > 0 && showcaseMode) {
      triggerShowcaseAnim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerShowcase]);

  // ---- Squish on tap/click ----
  const handleSquish = useCallback(() => {
    if (showcaseMode && rarity) {
      triggerShowcaseAnim();
      return;
    }
    // Quick squash & stretch
    squishX.set(1.15);
    squishY.set(0.82);
    setTimeout(() => {
      squishX.set(0.9);
      squishY.set(1.12);
    }, 100);
    setTimeout(() => {
      squishX.set(1.05);
      squishY.set(0.96);
    }, 220);
    setTimeout(() => {
      squishX.set(1);
      squishY.set(1);
    }, 350);
  }, [squishX, squishY, showcaseMode, rarity, triggerShowcaseAnim]);

  // ---- Squish on hover ----
  const handleHoverStart = useCallback(() => {
    squishX.set(1.06);
    squishY.set(0.95);
  }, [squishX, squishY]);

  const handleHoverEnd = useCallback(() => {
    squishX.set(1);
    squishY.set(1);
  }, [squishX, squishY]);

  // Mishi Bao alternating expression
  const isMishi = baoId === 'MISHI';
  const isLegendary = baoId === 'LONG' || baoId === 'FENG_HUANG' || baoId === 'MISHI' || baoId === 'LEXICON';
  const [mishiPhase, setMishiPhase] = useState<'puppy' | 'happy' | 'transition'>(revealMode ? 'puppy' : 'puppy');

  useEffect(() => {
    if (!isMishi || revealMode) return; // In reveal mode, lock to puppy eyes
    const cycle = () => {
      setMishiPhase('transition');
      setTimeout(() => {
        setMishiPhase((prev) => prev === 'puppy' || prev === 'transition' ? 'happy' : 'puppy');
      }, 200);
    };
    const scheduleNext = () => {
      const nextDelay = 2500 + Math.random() * 2500;
      return setTimeout(() => {
        cycle();
        timerRef = scheduleNext();
      }, nextDelay);
    };
    let timerRef = scheduleNext();
    return () => clearTimeout(timerRef);
  }, [isMishi, revealMode]);

  // ---- Render eye blink overlay (just horizontal lines over eye positions) ----
  const renderBlinkOverlay = () => {
    if (!isBlinking) return null;
    // Cover the eye area with a blink line in base color
    return (
      <g className="bao-blink-overlay">
        <line x1="33" y1="50" x2="43" y2="50" stroke={baseColor} strokeWidth="12" />
        <line x1="57" y1="50" x2="67" y2="50" stroke={baseColor} strokeWidth="12" />
        {/* Closed eye lines */}
        <path d="M33 50 Q38 47 43 50" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
        <path d="M57 50 Q62 47 67 50" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  };

  // ---- Mishi MEGA puppy eyes for reveal mode ----
  const renderMishiRevealFace = () => (
    <g className="bao-face bao-reveal-face">
      {/* Huge glistening puppy-dog eyes — anime style */}
      {/* Left eye */}
      <ellipse cx="36" cy="46" rx="9" ry="10" fill="#4a3728" />
      <ellipse cx="36" cy="46" rx="8" ry="9" fill="#5a2d1a" />
      {/* Iris gradient */}
      <ellipse cx="36" cy="47" rx="6" ry="7" fill="#7B3F00" />
      <ellipse cx="36" cy="48" rx="5" ry="5.5" fill="#9B5B2F" />
      {/* Big sparkle highlights */}
      <circle cx="32" cy="42" r="3.5" fill="white" opacity="0.95" />
      <circle cx="39" cy="50" r="2" fill="white" opacity="0.85" />
      <circle cx="34" cy="44" r="1" fill="white" opacity="0.7" />
      {/* Star sparkle in eye */}
      <polygon points="32,42 32.8,43.5 34.5,43.5 33.2,44.5 33.6,46.2 32,45.2 30.4,46.2 30.8,44.5 29.5,43.5 31.2,43.5" fill="white" opacity="0.6" />

      {/* Right eye */}
      <ellipse cx="64" cy="46" rx="9" ry="10" fill="#4a3728" />
      <ellipse cx="64" cy="46" rx="8" ry="9" fill="#5a2d1a" />
      <ellipse cx="64" cy="47" rx="6" ry="7" fill="#7B3F00" />
      <ellipse cx="64" cy="48" rx="5" ry="5.5" fill="#9B5B2F" />
      <circle cx="60" cy="42" r="3.5" fill="white" opacity="0.95" />
      <circle cx="67" cy="50" r="2" fill="white" opacity="0.85" />
      <circle cx="62" cy="44" r="1" fill="white" opacity="0.7" />
      <polygon points="60,42 60.8,43.5 62.5,43.5 61.2,44.5 61.6,46.2 60,45.2 58.4,46.2 58.8,44.5 57.5,43.5 59.2,43.5" fill="white" opacity="0.6" />

      {/* Trembling eyebrows (worried/pleading) */}
      <path d="M25 36 Q30 32 40 36" fill="none" stroke="#4a3728" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M60 36 Q70 32 75 36" fill="none" stroke="#4a3728" strokeWidth="1.8" strokeLinecap="round" />

      {/* Extra rosy cheeks */}
      <ellipse cx="24" cy="56" rx="8" ry="4.5" fill="#ffb3b3" opacity="0.7" />
      <ellipse cx="76" cy="56" rx="8" ry="4.5" fill="#ffb3b3" opacity="0.7" />

      {/* Tiny open mouth */}
      <ellipse cx="50" cy="60" rx="4" ry="3" fill="#4a3728" opacity="0.8" />
      <ellipse cx="50" cy="59" rx="3" ry="1.5" fill="#ff8a8a" opacity="0.4" />

      {/* Tiny tear sparkle */}
      <circle cx="24" cy="50" r="1.2" fill="white" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="76" cy="50" r="1.2" fill="white" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
      </circle>
    </g>
  );

  // ---- Legendary reveal effects (rendered as SVG overlays) ----
  const renderRevealEffects = () => {
    if (!revealMode || !isLegendary) return null;
    const effects: React.ReactNode[] = [];

    if (baoId === 'LONG') {
      // Dragon Bao: flickering flame wisps around body
      effects.push(
        <g key="dragon-flames" className="bao-reveal-flames">
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 15 + i * 17;
            const delay = i * 0.3;
            return (
              <g key={i}>
                <path
                  d={`M${x} 68 Q${x - 3} ${55 - i * 2} ${x + 2} ${45 - i * 3} Q${x + 5} ${55 - i * 2} ${x + 3} 68`}
                  fill="#FFD700"
                  opacity="0.4"
                >
                  <animate attributeName="opacity" values="0.2;0.5;0.2" dur="0.8s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate attributeName="d"
                    values={`M${x} 68 Q${x - 3} ${55 - i * 2} ${x + 2} ${45 - i * 3} Q${x + 5} ${55 - i * 2} ${x + 3} 68;M${x} 68 Q${x - 5} ${52 - i * 2} ${x + 1} ${42 - i * 3} Q${x + 6} ${52 - i * 2} ${x + 3} 68;M${x} 68 Q${x - 3} ${55 - i * 2} ${x + 2} ${45 - i * 3} Q${x + 5} ${55 - i * 2} ${x + 3} 68`}
                    dur="1.2s" begin={`${delay}s`} repeatCount="indefinite" />
                </path>
                <path
                  d={`M${x + 1} 68 Q${x - 1} ${58 - i * 2} ${x + 2} ${50 - i * 3} Q${x + 4} ${58 - i * 2} ${x + 2} 68`}
                  fill="#FF4500"
                  opacity="0.3"
                >
                  <animate attributeName="opacity" values="0.15;0.4;0.15" dur="0.6s" begin={`${delay + 0.1}s`} repeatCount="indefinite" />
                </path>
              </g>
            );
          })}
        </g>
      );
    }

    if (baoId === 'FENG_HUANG') {
      // Phoenix Bao: floating feather-like particles
      effects.push(
        <g key="phoenix-feathers" className="bao-reveal-feathers">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = i * 60;
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + Math.cos(rad) * 38;
            const cy = 45 + Math.sin(rad) * 30;
            const delay = i * 0.4;
            return (
              <g key={i}>
                <ellipse cx={cx} cy={cy} rx="3" ry="1" fill="#FFD54F" opacity="0.6" transform={`rotate(${angle + 45}, ${cx}, ${cy})`}>
                  <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,-15" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx={cx} cy={cy} rx="2" ry="0.8" fill="#FF6F00" opacity="0.4" transform={`rotate(${angle + 45}, ${cx}, ${cy})`}>
                  <animate attributeName="opacity" values="0;0.4;0" dur="2s" begin={`${delay + 0.2}s`} repeatCount="indefinite" />
                </ellipse>
              </g>
            );
          })}
        </g>
      );
    }

    if (baoId === 'LEXICON') {
      // Lexicon Bao: Sichuan chili spark particles + power calligraphy strokes
      effects.push(
        <g key="lexicon-fire" className="bao-reveal-lexicon">
          {/* Chili pepper spark particles swirling around */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = i * 60 + 15;
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + Math.cos(rad) * 35;
            const cy = 45 + Math.sin(rad) * 28;
            const delay = i * 0.35;
            return (
              <g key={i}>
                {/* Chili-shaped spark */}
                <path
                  d={`M${cx} ${cy} Q${cx + 3} ${cy - 4} ${cx + 1} ${cy - 8} Q${cx - 1} ${cy - 4} ${cx} ${cy}`}
                  fill="#FF2400"
                  opacity="0"
                >
                  <animate attributeName="opacity" values="0;0.7;0" dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="translate" values="0,0;0,-12" dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
                </path>
                {/* Tiny gold ember */}
                <circle cx={cx + 2} cy={cy - 3} r="1.2" fill="#FFD700" opacity="0">
                  <animate attributeName="opacity" values="0;0.8;0" dur="1.2s" begin={`${delay + 0.2}s`} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
          {/* Power calligraphy stroke marks */}
          {[
            { x1: 20, y1: 25, x2: 30, y2: 18, d: 0 },
            { x1: 70, y1: 25, x2: 80, y2: 18, d: 0.4 },
            { x1: 15, y1: 60, x2: 10, y2: 55, d: 0.8 },
            { x1: 85, y1: 60, x2: 90, y2: 55, d: 1.2 },
          ].map(({ x1, y1, x2, y2, d }, i) => (
            <line key={`stroke-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" opacity="0">
              <animate attributeName="opacity" values="0;0.6;0" dur="2s" begin={`${d}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      );
    }

    if (baoId === 'MISHI') {
      // Mishi Bao: floating hearts + sparkle stars
      effects.push(
        <g key="mishi-hearts" className="bao-reveal-hearts">
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 10 + i * 20;
            const delay = i * 0.5;
            return (
              <g key={i}>
                <path
                  d={`M${x} 30 C${x - 3} 25, ${x - 6} 30, ${x} 36 C${x + 6} 30, ${x + 3} 25, ${x} 30`}
                  fill="#FF69B4"
                  opacity="0"
                >
                  <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="translate" values="0,0;0,-15" dur="2.5s" begin={`${delay}s`} repeatCount="indefinite" />
                </path>
              </g>
            );
          })}
          {/* Anime sparkle stars around face */}
          {[
            { x: 18, y: 35, s: 3, d: 0 },
            { x: 82, y: 35, s: 2.5, d: 0.3 },
            { x: 12, y: 55, s: 2, d: 0.6 },
            { x: 88, y: 55, s: 2, d: 0.9 },
            { x: 50, y: 5, s: 3.5, d: 0.2 },
          ].map(({ x, y, s, d }, i) => (
            <g key={`star-${i}`}>
              {/* 4-point star */}
              <polygon
                points={`${x},${y - s} ${x + s * 0.3},${y - s * 0.3} ${x + s},${y} ${x + s * 0.3},${y + s * 0.3} ${x},${y + s} ${x - s * 0.3},${y + s * 0.3} ${x - s},${y} ${x - s * 0.3},${y - s * 0.3}`}
                fill="white"
                opacity="0"
              >
                <animate attributeName="opacity" values="0;0.9;0" dur="1.5s" begin={`${d}s`} repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="scale" values="0.5;1.2;0.5" dur="1.5s" begin={`${d}s`} repeatCount="indefinite" additive="sum" />
              </polygon>
            </g>
          ))}
        </g>
      );
    }

    return <>{effects}</>;
  };

  // Mishi special faces
  const renderMishiFace = () => {
    // In reveal mode or showcase megaPuppy override, show mega puppy eyes
    if (revealMode || showcaseFaceOverride === 'megaPuppy') return renderMishiRevealFace();

    // Wink face for mishiWink showcase
    if (showcaseFaceOverride === 'wink') {
      return (
        <g className="bao-face bao-wink-face">
          {/* Left eye — closed wink (arc) */}
          <path d="M30 50 Q36 45 42 50" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right eye — sparkle star */}
          <polygon points="62,45 63.5,49 67.5,49 64.5,51.5 65.5,55.5 62,53 58.5,55.5 59.5,51.5 56.5,49 60.5,49" fill="#4a3728" />
          <circle cx="60" cy="48" r="1.5" fill="white" opacity="0.9" />
          {/* Cheeks */}
          <ellipse cx="29" cy="56" rx="6" ry="3.5" fill="#ffb3b3" opacity="0.65" />
          <ellipse cx="71" cy="56" rx="6" ry="3.5" fill="#ffb3b3" opacity="0.65" />
          {/* Cute smile */}
          <path d="M44 58 Q50 62 56 58" fill="none" stroke="#4a3728" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    }

    if (mishiPhase === 'transition') {
      return (
        <g className="bao-face">
          <path d="M33 50 Q38 52 43 50" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M57 50 Q62 52 67 50" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="30" cy="55" rx="6" ry="3.5" fill="#ffb3b3" opacity="0.6" />
          <ellipse cx="70" cy="55" rx="6" ry="3.5" fill="#ffb3b3" opacity="0.6" />
        </g>
      );
    }
    if (mishiPhase === 'happy') {
      return (
        <g className="bao-face">
          {/* Happy closed eyes — upside-down arcs (content/pleased look) */}
          <path d="M33 49 Q38 44 43 49" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M57 49 Q62 44 67 49" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
          {/* Big happy smile */}
          <path d="M42 57 Q50 63 58 57" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          {/* Rosy cheeks */}
          <ellipse cx="29" cy="55" rx="6.5" ry="3.5" fill="#ffb3b3" opacity="0.65" />
          <ellipse cx="71" cy="55" rx="6.5" ry="3.5" fill="#ffb3b3" opacity="0.65" />
        </g>
      );
    }
    return (
      <g className="bao-face">
        <ellipse cx="38" cy="48" rx="6" ry="7" fill="#4a3728" />
        <ellipse cx="62" cy="48" rx="6" ry="7" fill="#4a3728" />
        <circle cx="35.5" cy="45.5" r="3" fill="white" opacity="0.95" />
        <circle cx="59.5" cy="45.5" r="3" fill="white" opacity="0.95" />
        <circle cx="40" cy="50" r="1.5" fill="white" opacity="0.6" />
        <circle cx="64" cy="50" r="1.5" fill="white" opacity="0.6" />
        <path d="M31 40 Q35 38 42 41" fill="none" stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M69 40 Q65 38 58 41" fill="none" stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M46 58 Q50 61 54 58" fill="none" stroke="#4a3728" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="29" cy="56" rx="6.5" ry="4" fill="#ffb3b3" opacity="0.65" />
        <ellipse cx="71" cy="56" rx="6.5" ry="4" fill="#ffb3b3" opacity="0.65" />
        <circle cx="32" cy="52" r="1" fill="white" opacity="0.7" />
        <circle cx="68" cy="52" r="1" fill="white" opacity="0.7" />
      </g>
    );
  };

  // ---- Face rendering by expression ----
  const renderFace = () => {
    if (isMishi) return renderMishiFace();

    switch (faceExpression) {
      case 'happy':
        return (
          <g className="bao-face">
            <g className="bao-eyes">
              <ellipse cx="38" cy="50" rx="3.5" ry="4" fill="#4a3728" />
              <ellipse cx="62" cy="50" rx="3.5" ry="4" fill="#4a3728" />
              <circle cx="36.5" cy="48.5" r="1.5" fill="white" opacity="0.9" />
              <circle cx="60.5" cy="48.5" r="1.5" fill="white" opacity="0.9" />
            </g>
            <ellipse cx="30" cy="56" rx="5" ry="3" fill="#ffb3b3" opacity="0.5" />
            <ellipse cx="70" cy="56" rx="5" ry="3" fill="#ffb3b3" opacity="0.5" />
            <path d="M43 57 Q50 64 57 57" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'sleepy':
        return (
          <g className="bao-face">
            <path d="M33 50 Q38 46 43 50" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M57 50 Q62 46 67 50" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="30" cy="55" rx="5" ry="3" fill="#ffb3b3" opacity="0.45" />
            <ellipse cx="70" cy="55" rx="5" ry="3" fill="#ffb3b3" opacity="0.45" />
            <ellipse cx="50" cy="59" rx="3" ry="2.5" fill="#4a3728" opacity="0.8" />
            <text x="68" y="40" fontSize="7" fill="#4a3728" opacity="0.4" fontFamily="sans-serif" fontWeight="bold">z</text>
            <text x="73" y="35" fontSize="5" fill="#4a3728" opacity="0.3" fontFamily="sans-serif" fontWeight="bold">z</text>
          </g>
        );

      case 'excited':
        return (
          <g className="bao-face">
            <g className="bao-eyes">
              <ellipse cx="38" cy="49" rx="5" ry="5.5" fill="#4a3728" />
              <ellipse cx="62" cy="49" rx="5" ry="5.5" fill="#4a3728" />
              <circle cx="36" cy="47" r="2.5" fill="white" opacity="0.95" />
              <circle cx="60" cy="47" r="2.5" fill="white" opacity="0.95" />
              <circle cx="40" cy="51" r="1.2" fill="white" opacity="0.6" />
              <circle cx="64" cy="51" r="1.2" fill="white" opacity="0.6" />
            </g>
            <ellipse cx="29" cy="56" rx="5.5" ry="3.5" fill="#ffb3b3" opacity="0.55" />
            <ellipse cx="71" cy="56" rx="5.5" ry="3.5" fill="#ffb3b3" opacity="0.55" />
            <path d="M40 57 Q50 67 60 57" fill="#4a3728" opacity="0.85" />
            <path d="M42 57 Q50 63 58 57" fill="#ff8a8a" opacity="0.5" />
          </g>
        );

      case 'smug':
        return (
          <g className="bao-face">
            <g className="bao-eyes">
              <ellipse cx="38" cy="50" rx="4" ry="3" fill="#4a3728" />
              <ellipse cx="62" cy="50" rx="4" ry="3" fill="#4a3728" />
              <path d="M33 48 L43 48" fill="none" stroke={baseColor} strokeWidth="3" />
              <path d="M57 48 L67 48" fill="none" stroke={baseColor} strokeWidth="3" />
              <circle cx="36.5" cy="49" r="1.5" fill="white" opacity="0.8" />
              <circle cx="60.5" cy="49" r="1.5" fill="white" opacity="0.8" />
            </g>
            <path d="M42 57 Q50 62 58 55" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="30" cy="55" rx="4.5" ry="2.8" fill="#ffb3b3" opacity="0.35" />
            <ellipse cx="70" cy="55" rx="4.5" ry="2.8" fill="#ffb3b3" opacity="0.35" />
          </g>
        );

      case 'sparkle':
        return (
          <g className="bao-face">
            <g className="bao-eyes">
              <polygon points="38,45 39.5,49 43.5,49 40.5,51.5 41.5,55.5 38,53 34.5,55.5 35.5,51.5 32.5,49 36.5,49" fill="#4a3728" />
              <polygon points="62,45 63.5,49 67.5,49 64.5,51.5 65.5,55.5 62,53 58.5,55.5 59.5,51.5 56.5,49 60.5,49" fill="#4a3728" />
              <circle cx="36" cy="48" r="1.5" fill="white" opacity="0.9" />
              <circle cx="60" cy="48" r="1.5" fill="white" opacity="0.9" />
            </g>
            <ellipse cx="29" cy="57" rx="5" ry="3" fill="#ffb3b3" opacity="0.5" />
            <ellipse cx="71" cy="57" rx="5" ry="3" fill="#ffb3b3" opacity="0.5" />
            <path d="M44 58 Q47 62 50 58 Q53 62 56 58" fill="none" stroke="#4a3728" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );

      case 'bliss':
        return (
          <g className="bao-face">
            <path d="M34 49 Q38 54 42 49" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M58 49 Q62 54 66 49" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="30" cy="55" rx="6" ry="3.5" fill="#ffb3b3" opacity="0.6" />
            <ellipse cx="70" cy="55" rx="6" ry="3.5" fill="#ffb3b3" opacity="0.6" />
            <path d="M43 58 Q50 65 57 58" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'fierce':
        return (
          <g className="bao-face">
            <g className="bao-eyes">
              <ellipse cx="38" cy="50" rx="4" ry="4.5" fill="#4a3728" />
              <ellipse cx="62" cy="50" rx="4" ry="4.5" fill="#4a3728" />
              <path d="M30 44 L42 47" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M70 44 L58 47" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="36" cy="48" r="2" fill="white" opacity="0.9" />
              <circle cx="60" cy="48" r="2" fill="white" opacity="0.9" />
            </g>
            <path d="M40 58 L44 56 Q50 61 56 56 L60 58" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="29" cy="56" rx="4" ry="2.5" fill="#ff8a8a" opacity="0.4" />
            <ellipse cx="71" cy="56" rx="4" ry="2.5" fill="#ff8a8a" opacity="0.4" />
          </g>
        );

      default:
        return (
          <g className="bao-face">
            <circle cx="38" cy="50" r="3" fill="#4a3728" />
            <circle cx="62" cy="50" r="3" fill="#4a3728" />
            <path d="M44 57 Q50 63 56 57" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
    }
  };

  // ---- Pattern defs ----
  const renderPatternDefs = () => {
    switch (pattern) {
      case 'swirl':
        return (
          <pattern id={`${uid}-pattern`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="8" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.3" />
            <path d="M10 2 Q18 10 10 18 Q2 10 10 2" fill="none" stroke={accentColor} strokeWidth="1" opacity="0.25" />
          </pattern>
        );
      case 'dots':
        return (
          <pattern id={`${uid}-pattern`} width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill={accentColor} opacity="0.25" />
            <circle cx="9" cy="9" r="2" fill={accentColor} opacity="0.25" />
          </pattern>
        );
      case 'gradient':
        return (
          <linearGradient id={`${uid}-pattern`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="50%" stopColor={accentColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={baseColor} />
          </linearGradient>
        );
      case 'marble':
        return (
          <filter id={`${uid}-pattern`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed={baoId.length * 7} result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" result="bw" />
            <feBlend in="SourceGraphic" in2="bw" mode="overlay" />
          </filter>
        );
      case 'stripes':
        return (
          <pattern id={`${uid}-pattern`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
            <rect width="4" height="8" fill={accentColor} opacity="0.2" />
          </pattern>
        );
      case 'crystal':
        return (
          <pattern id={`${uid}-pattern`} width="16" height="16" patternUnits="userSpaceOnUse">
            <polygon points="8,0 16,8 8,16 0,8" fill="none" stroke={accentColor} strokeWidth="0.8" opacity="0.3" />
            <polygon points="8,4 12,8 8,12 4,8" fill={accentColor} opacity="0.1" />
          </pattern>
        );
      case 'flame':
        return (
          <pattern id={`${uid}-pattern`} width="16" height="20" patternUnits="userSpaceOnUse">
            <path d="M8 18 Q4 12 8 6 Q12 12 8 18" fill={accentColor} opacity="0.2" />
            <path d="M8 16 Q6 12 8 9 Q10 12 8 16" fill={accentColor} opacity="0.15" />
          </pattern>
        );
      default:
        return null;
    }
  };

  const renderPatternOverlay = () => {
    if (pattern === 'solid' || pattern === 'marble') return null;
    return (
      <path
        d="M15 70 Q15 20 50 10 Q85 20 85 70 Z"
        fill={pattern === 'gradient' ? `url(#${uid}-pattern)` : `url(#${uid}-pattern)`}
        opacity={pattern === 'gradient' ? 0.7 : 1}
      />
    );
  };

  // ---- Rank-based effects ----
  const renderRankEffects = () => {
    const effects: React.ReactNode[] = [];

    if (rank >= 6) {
      effects.push(
        <g key="crown" className="bao-crown">
          <polygon points="40,12 43,6 46,10 50,3 54,10 57,6 60,12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8" />
          <circle cx="46" cy="9" r="1" fill="#ff6b6b" />
          <circle cx="50" cy="6" r="1.2" fill="#60a5fa" />
          <circle cx="54" cy="9" r="1" fill="#4ade80" />
        </g>
      );
    }

    if (rank >= 7) {
      effects.push(
        <g key="wings" className="bao-wings" opacity="0.7">
          <path d="M14 45 Q2 35 8 25 Q12 32 16 38" fill="white" stroke={accentColor} strokeWidth="0.5" opacity="0.6" />
          <path d="M13 48 Q0 42 5 30 Q10 38 15 42" fill="white" opacity="0.4" />
          <path d="M86 45 Q98 35 92 25 Q88 32 84 38" fill="white" stroke={accentColor} strokeWidth="0.5" opacity="0.6" />
          <path d="M87 48 Q100 42 95 30 Q90 38 85 42" fill="white" opacity="0.4" />
        </g>
      );
    }

    if (rank >= 8) {
      effects.push(
        <g key="cosmic" className="bao-cosmic">
          <circle cx="50" cy="45" r="46" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
          <circle cx="50" cy="45" r="42" fill="none" stroke={accentColor} strokeWidth="0.3" opacity="0.2" strokeDasharray="3 5" />
          <circle cx="50" cy="45" r="48" fill="none" stroke={accentColor} strokeWidth="0.3" opacity="0.15" strokeDasharray="1 4" />
          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 46 * Math.cos(rad);
            const y = 45 + 46 * Math.sin(rad);
            return <circle key={angle} cx={x} cy={y} r="1" fill={accentColor} opacity="0.4" />;
          })}
        </g>
      );
    }

    return effects;
  };

  // ---- Build CSS classes based on rank ----
  const rankClasses = useMemo(() => {
    const classes = ['bao-art-wrapper'];
    if (rank >= 1) classes.push('bao-glow');
    if (rank >= 2) classes.push('bao-sparkles');
    if (rank >= 3) classes.push('bao-aura');
    if (rank >= 4) classes.push('bao-shimmer');
    if (rank >= 5) classes.push('bao-particles');
    if (rank >= 9) classes.push('bao-max-rank');
    return classes.join(' ');
  }, [rank]);

  const auraColor = accentColor;

  return (
    <motion.div
      className={rankClasses}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        '--bao-aura-color': auraColor,
        '--bao-accent': accentColor,
        y: springIdleY,
        rotate: springIdleRotate,
      } as any}
      onTap={handleSquish}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileTap={{ scale: 0.95 }}
    >
      {rank >= 2 && (
        <div className="bao-sparkle-container" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="bao-sparkle-dot"
              style={{
                animationDelay: `${i * 0.4}s`,
                top: `${10 + i * 20}%`,
                left: i % 2 === 0 ? '5%' : '85%',
              }}
            />
          ))}
        </div>
      )}

      {rank >= 5 && (
        <div className="bao-particle-container" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="bao-particle"
              style={{
                animationDelay: `${i * 0.6}s`,
                left: `${15 + i * 13}%`,
                '--drift-x': `${(i % 2 === 0 ? 1 : -1) * (5 + i * 3)}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {rank >= 9 && <div className="bao-golden-border" aria-hidden="true" />}

      {artUrl ? (
        /* AI-generated art image mode */
        <motion.img
          src={artUrl}
          alt={`Bao character ${baoId}`}
          draggable={false}
          style={{
            width: size,
            height: size,
            objectFit: 'contain',
            transform: svgTransform,
            transformOrigin: '50% 85%',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      ) : (
        /* Default SVG procedural rendering */
        <motion.svg
          viewBox="0 0 100 85"
          width={size}
          height={size * 0.85}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`Bao character ${baoId}`}
          style={{
            transform: svgTransform,
            transformOrigin: '50% 85%',
          }}
        >
          <defs>
            <radialGradient id={`${uid}-bun-grad`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor={baseColor} stopOpacity="0" />
            </radialGradient>

            <radialGradient id={`${uid}-shadow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4a3728" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#4a3728" stopOpacity="0" />
            </radialGradient>

            {rank >= 4 && (
              <linearGradient id={`${uid}-shimmer`} x1="-100%" y1="0%" x2="200%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="45%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.4" />
                <stop offset="55%" stopColor="white" stopOpacity="0" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            )}

            <clipPath id={`${uid}-bun-clip`}>
              <path d="M15 70 Q15 20 50 10 Q85 20 85 70 Z" />
            </clipPath>

            {renderPatternDefs()}
          </defs>

          {renderRankEffects().filter((e) => e && (e as React.ReactElement).key === 'cosmic')}

          {rank >= 3 && (
            <ellipse cx="50" cy="55" rx="44" ry="30" fill="none" stroke={auraColor} strokeWidth="1.5" opacity="0.3" className="bao-aura-ring" />
          )}

          <ellipse cx="50" cy="75" rx="30" ry="5" fill={`url(#${uid}-shadow)`} />

          <g className="bao-bun">
            <path
              d="M15 70 Q15 20 50 10 Q85 20 85 70 Z"
              fill={baseColor}
              stroke={rank >= 9 ? '#fbbf24' : baseColor}
              strokeWidth={rank >= 9 ? 2 : 0.5}
              filter={pattern === 'marble' ? `url(#${uid}-pattern)` : undefined}
            />
            <rect x="15" y="67" width="70" height="6" rx="2" fill={baseColor} opacity="0.9" />
            <rect x="15" y="70" width="70" height="3" rx="1.5" fill="#00000010" />
            <path d="M15 70 Q15 20 50 10 Q85 20 85 70 Z" fill={`url(#${uid}-bun-grad)`} />
            <path d="M42 15 Q50 12 58 15" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
            <path d="M38 18 Q50 14 62 18" fill="none" stroke="white" strokeWidth="0.6" opacity="0.25" />
            {renderPatternOverlay()}
            {rank >= 4 && (
              <path d="M15 70 Q15 20 50 10 Q85 20 85 70 Z" fill={`url(#${uid}-shimmer)`} clipPath={`url(#${uid}-bun-clip)`} className="bao-shimmer-sweep" />
            )}
          </g>

          {renderRankEffects().filter((e) => e && (e as React.ReactElement).key === 'wings')}
          {renderRankEffects().filter((e) => e && (e as React.ReactElement).key === 'crown')}

          {/* Lexicon Bao accessories: topknot bun + sash */}
          {baoId === 'LEXICON' && (
            <g className="bao-lexicon-accessories">
              {/* Hair bun / topknot */}
              <ellipse cx="50" cy="10" rx="8" ry="5" fill="#3a1a0a" />
              <ellipse cx="50" cy="8" rx="5.5" ry="4" fill="#4a2a1a" />
              {/* Hair pin with gold ornament */}
              <line x1="42" y1="9" x2="58" y2="7" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="42" cy="9" r="2" fill="#FF2400" stroke="#FFD700" strokeWidth="0.5" />
              <circle cx="58" cy="7" r="1.5" fill="#FFD700" />
              {/* Sichuan-style collar/sash at base */}
              <path d="M25 67 Q35 62 50 63 Q65 62 75 67" fill="none" stroke="#FFD700" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M28 68 Q38 64 50 65 Q62 64 72 68" fill="none" stroke="#FF2400" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            </g>
          )}

          {renderFace()}
          {!revealMode && !showcaseFaceOverride && renderBlinkOverlay()}
          {renderRevealEffects()}
          {showcaseActive && (
            <ShowcaseOverlay
              animationId={showcaseAnimId}
              accentColor={accentColor}
              baseColor={baseColor}
            />
          )}
        </motion.svg>
      )}

      {/* Canvas particle effects — legendaries always, others at ★4+, or during pull reveal */}
      {(revealMode || rank >= 4 || rarity === Rarity.Legendary) && (
        <ShowcaseParticles
          animationId={showcaseAnimId}
          size={size}
          active={showcaseActive}
        />
      )}

      {/* Anime-style eye sparkle light rays for Mishi reveal / showcase */}
      {(revealMode || showcaseFaceOverride === 'megaPuppy') && isMishi && (
        <div className="bao-eye-sparkle-rays" aria-hidden="true" />
      )}

      {/* Legendary reveal aura glow */}
      {revealMode && isLegendary && (
        <div className="bao-legendary-reveal-aura" aria-hidden="true" style={{ '--aura-color': accentColor } as React.CSSProperties} />
      )}

      <style>{`
        .bao-sparkle-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .bao-sparkle-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: sparkle 1.8s ease-in-out infinite;
        }
        .bao-aura-ring {
          animation: pulse 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        .bao-shimmer-sweep {
          animation: shimmer 3s linear infinite;
        }
        .bao-particle-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: visible;
        }
        .bao-particle {
          position: absolute;
          bottom: 15%;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--bao-accent, #fbbf24);
          animation: particleFloat 3s ease-out infinite;
          opacity: 0;
        }
        .bao-crown {
          animation: float 2s ease-in-out infinite;
          transform-origin: center top;
        }
        .bao-wings {
          animation: float 1.8s ease-in-out infinite alternate;
        }
        .bao-golden-border {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 3px solid #fbbf24;
          animation: rainbowGlow 4s linear infinite;
          pointer-events: none;
        }
        .bao-max-rank svg {
          filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.6));
        }
        .bao-glow svg {
          filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.5));
        }

        /* Anime eye sparkle rays — radiating golden light from eyes */
        .bao-eye-sparkle-rays {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 250%;
          height: 100%;
          pointer-events: none;
          background:
            conic-gradient(
              from 0deg at 50% 35%,
              transparent 0deg,
              rgba(255, 215, 0, 0.25) 4deg,
              rgba(255, 255, 255, 0.3) 6deg,
              transparent 10deg,
              transparent 18deg,
              rgba(255, 215, 0, 0.2) 22deg,
              rgba(255, 255, 255, 0.22) 24deg,
              transparent 28deg,
              transparent 40deg,
              rgba(255, 215, 0, 0.25) 44deg,
              rgba(255, 255, 255, 0.28) 46deg,
              transparent 50deg,
              transparent 60deg,
              rgba(255, 215, 0, 0.18) 64deg,
              transparent 68deg,
              transparent 78deg,
              rgba(255, 215, 0, 0.25) 82deg,
              rgba(255, 255, 255, 0.3) 84deg,
              transparent 88deg,
              transparent 100deg,
              rgba(255, 215, 0, 0.2) 104deg,
              transparent 108deg,
              transparent 120deg,
              rgba(255, 215, 0, 0.22) 124deg,
              rgba(255, 255, 255, 0.25) 126deg,
              transparent 130deg,
              transparent 145deg,
              rgba(255, 215, 0, 0.18) 149deg,
              transparent 153deg,
              transparent 165deg,
              rgba(255, 215, 0, 0.25) 169deg,
              rgba(255, 255, 255, 0.3) 171deg,
              transparent 175deg,
              transparent 185deg,
              rgba(255, 215, 0, 0.22) 189deg,
              transparent 193deg,
              transparent 205deg,
              rgba(255, 215, 0, 0.25) 209deg,
              rgba(255, 255, 255, 0.28) 211deg,
              transparent 215deg,
              transparent 228deg,
              rgba(255, 215, 0, 0.18) 232deg,
              transparent 236deg,
              transparent 248deg,
              rgba(255, 215, 0, 0.25) 252deg,
              rgba(255, 255, 255, 0.3) 254deg,
              transparent 258deg,
              transparent 270deg,
              rgba(255, 215, 0, 0.2) 274deg,
              transparent 278deg,
              transparent 290deg,
              rgba(255, 215, 0, 0.22) 294deg,
              rgba(255, 255, 255, 0.25) 296deg,
              transparent 300deg,
              transparent 315deg,
              rgba(255, 215, 0, 0.18) 319deg,
              transparent 323deg,
              transparent 338deg,
              rgba(255, 215, 0, 0.25) 342deg,
              rgba(255, 255, 255, 0.28) 344deg,
              transparent 348deg,
              transparent 360deg
            );
          animation: eyeSparkleRays 4s linear infinite, eyeSparkleBreath 2s ease-in-out infinite;
          filter: blur(1px);
          opacity: 0.9;
          z-index: -1;
        }
        @keyframes eyeSparkleRays {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes eyeSparkleBreath {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(0.95); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.08); }
        }

        /* Legendary reveal aura — pulsing glow ring */
        .bao-legendary-reveal-aura {
          position: absolute;
          inset: -15%;
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          background: radial-gradient(circle, transparent 40%, var(--aura-color, #fbbf24) 60%, transparent 75%);
          opacity: 0.3;
          animation: legendaryAuraPulse 1.5s ease-in-out infinite;
        }
        @keyframes legendaryAuraPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.15); opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  );
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default BaoArt;
