import React, { useMemo } from 'react';

interface BaoArtProps {
  baoId: string;
  baseColor: string;
  accentColor: string;
  pattern: string;
  faceExpression: string;
  rank: number;
  size?: number;
}

/**
 * BaoArt — The core SVG component that renders a kawaii steamed bun.
 *
 * Each bao is a dome-shaped bun with a cute face, colored fills,
 * visual patterns, and rank-based special effects.
 */
const BaoArt: React.FC<BaoArtProps> = ({
  baoId,
  baseColor,
  accentColor,
  pattern,
  faceExpression,
  rank,
  size = 120,
}) => {
  const uid = useMemo(() => `bao-${baoId}-${Math.random().toString(36).slice(2, 8)}`, [baoId]);

  // ---- Face rendering by expression ----
  const renderFace = () => {
    // All faces are centered at roughly (50, 52) within 100x100 viewBox
    switch (faceExpression) {
      case 'happy':
        return (
          <g className="bao-face">
            {/* Eyes — round dots */}
            <ellipse cx="38" cy="50" rx="3.5" ry="4" fill="#4a3728" />
            <ellipse cx="62" cy="50" rx="3.5" ry="4" fill="#4a3728" />
            {/* Eye highlights */}
            <circle cx="36.5" cy="48.5" r="1.5" fill="white" opacity="0.9" />
            <circle cx="60.5" cy="48.5" r="1.5" fill="white" opacity="0.9" />
            {/* Cheek blush */}
            <ellipse cx="30" cy="56" rx="5" ry="3" fill="#ffb3b3" opacity="0.5" />
            <ellipse cx="70" cy="56" rx="5" ry="3" fill="#ffb3b3" opacity="0.5" />
            {/* Smile — curved line */}
            <path d="M43 57 Q50 64 57 57" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'sleepy':
        return (
          <g className="bao-face">
            {/* Closed eyes — curved lines */}
            <path d="M33 50 Q38 46 43 50" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M57 50 Q62 46 67 50" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cheek blush */}
            <ellipse cx="30" cy="55" rx="5" ry="3" fill="#ffb3b3" opacity="0.45" />
            <ellipse cx="70" cy="55" rx="5" ry="3" fill="#ffb3b3" opacity="0.45" />
            {/* Sleepy mouth — small 'o' */}
            <ellipse cx="50" cy="59" rx="3" ry="2.5" fill="#4a3728" opacity="0.8" />
            {/* Zzz */}
            <text x="68" y="40" fontSize="7" fill="#4a3728" opacity="0.4" fontFamily="sans-serif" fontWeight="bold">z</text>
            <text x="73" y="35" fontSize="5" fill="#4a3728" opacity="0.3" fontFamily="sans-serif" fontWeight="bold">z</text>
          </g>
        );

      case 'excited':
        return (
          <g className="bao-face">
            {/* Big sparkly eyes */}
            <ellipse cx="38" cy="49" rx="5" ry="5.5" fill="#4a3728" />
            <ellipse cx="62" cy="49" rx="5" ry="5.5" fill="#4a3728" />
            {/* Large highlights for starry look */}
            <circle cx="36" cy="47" r="2.5" fill="white" opacity="0.95" />
            <circle cx="60" cy="47" r="2.5" fill="white" opacity="0.95" />
            <circle cx="40" cy="51" r="1.2" fill="white" opacity="0.6" />
            <circle cx="64" cy="51" r="1.2" fill="white" opacity="0.6" />
            {/* Blush */}
            <ellipse cx="29" cy="56" rx="5.5" ry="3.5" fill="#ffb3b3" opacity="0.55" />
            <ellipse cx="71" cy="56" rx="5.5" ry="3.5" fill="#ffb3b3" opacity="0.55" />
            {/* Wide open smile */}
            <path d="M40 57 Q50 67 60 57" fill="#4a3728" opacity="0.85" />
            <path d="M42 57 Q50 63 58 57" fill="#ff8a8a" opacity="0.5" />
          </g>
        );

      case 'smug':
        return (
          <g className="bao-face">
            {/* Half-lidded eyes */}
            <ellipse cx="38" cy="50" rx="4" ry="3" fill="#4a3728" />
            <ellipse cx="62" cy="50" rx="4" ry="3" fill="#4a3728" />
            {/* Flat eyelid lines */}
            <path d="M33 48 L43 48" fill="none" stroke={baseColor} strokeWidth="3" />
            <path d="M57 48 L67 48" fill="none" stroke={baseColor} strokeWidth="3" />
            {/* Highlights */}
            <circle cx="36.5" cy="49" r="1.5" fill="white" opacity="0.8" />
            <circle cx="60.5" cy="49" r="1.5" fill="white" opacity="0.8" />
            {/* Smug grin — asymmetric */}
            <path d="M42 57 Q50 62 58 55" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
            {/* Light blush */}
            <ellipse cx="30" cy="55" rx="4.5" ry="2.8" fill="#ffb3b3" opacity="0.35" />
            <ellipse cx="70" cy="55" rx="4.5" ry="2.8" fill="#ffb3b3" opacity="0.35" />
          </g>
        );

      case 'sparkle':
        return (
          <g className="bao-face">
            {/* Star eyes */}
            <polygon points="38,45 39.5,49 43.5,49 40.5,51.5 41.5,55.5 38,53 34.5,55.5 35.5,51.5 32.5,49 36.5,49" fill="#4a3728" />
            <polygon points="62,45 63.5,49 67.5,49 64.5,51.5 65.5,55.5 62,53 58.5,55.5 59.5,51.5 56.5,49 60.5,49" fill="#4a3728" />
            {/* Star highlights */}
            <circle cx="36" cy="48" r="1.5" fill="white" opacity="0.9" />
            <circle cx="60" cy="48" r="1.5" fill="white" opacity="0.9" />
            {/* Blush */}
            <ellipse cx="29" cy="57" rx="5" ry="3" fill="#ffb3b3" opacity="0.5" />
            <ellipse cx="71" cy="57" rx="5" ry="3" fill="#ffb3b3" opacity="0.5" />
            {/* Cat-like smile */}
            <path d="M44 58 Q47 62 50 58 Q53 62 56 58" fill="none" stroke="#4a3728" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );

      case 'bliss':
        return (
          <g className="bao-face">
            {/* Upturned closed eyes (U shape) */}
            <path d="M34 49 Q38 54 42 49" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M58 49 Q62 54 66 49" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            {/* Heavy blush */}
            <ellipse cx="30" cy="55" rx="6" ry="3.5" fill="#ffb3b3" opacity="0.6" />
            <ellipse cx="70" cy="55" rx="6" ry="3.5" fill="#ffb3b3" opacity="0.6" />
            {/* Blissful smile */}
            <path d="M43 58 Q50 65 57 58" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'fierce':
        return (
          <g className="bao-face">
            {/* Angled fierce eyes */}
            <ellipse cx="38" cy="50" rx="4" ry="4.5" fill="#4a3728" />
            <ellipse cx="62" cy="50" rx="4" ry="4.5" fill="#4a3728" />
            {/* Angry eyebrow lines */}
            <path d="M30 44 L42 47" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M70 44 L58 47" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            {/* Sharp highlights */}
            <circle cx="36" cy="48" r="2" fill="white" opacity="0.9" />
            <circle cx="60" cy="48" r="2" fill="white" opacity="0.9" />
            {/* Determined grin */}
            <path d="M40 58 L44 56 Q50 61 56 56 L60 58" fill="none" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Light flame blush */}
            <ellipse cx="29" cy="56" rx="4" ry="2.5" fill="#ff8a8a" opacity="0.4" />
            <ellipse cx="71" cy="56" rx="4" ry="2.5" fill="#ff8a8a" opacity="0.4" />
          </g>
        );

      default:
        // fallback: simple happy face
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
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="bw"
            />
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
      default: // 'solid'
        return null;
    }
  };

  // Apply pattern overlay
  const renderPatternOverlay = () => {
    if (pattern === 'solid') return null;

    if (pattern === 'marble') {
      return null; // marble uses a filter applied to the bun shape
    }

    if (pattern === 'gradient') {
      return (
        <path
          d="M15 70 Q15 20 50 10 Q85 20 85 70 Z"
          fill={`url(#${uid}-pattern)`}
          opacity="0.7"
        />
      );
    }

    return (
      <path
        d="M15 70 Q15 20 50 10 Q85 20 85 70 Z"
        fill={`url(#${uid}-pattern)`}
      />
    );
  };

  // ---- Rank-based effects ----
  const renderRankEffects = () => {
    const effects: React.ReactNode[] = [];

    // Rank 6+: tiny crown
    if (rank >= 6) {
      effects.push(
        <g key="crown" className="bao-crown">
          <polygon
            points="40,12 43,6 46,10 50,3 54,10 57,6 60,12"
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth="0.8"
          />
          {/* Crown jewels */}
          <circle cx="46" cy="9" r="1" fill="#ff6b6b" />
          <circle cx="50" cy="6" r="1.2" fill="#60a5fa" />
          <circle cx="54" cy="9" r="1" fill="#4ade80" />
        </g>
      );
    }

    // Rank 7+: wing shapes
    if (rank >= 7) {
      effects.push(
        <g key="wings" className="bao-wings" opacity="0.7">
          {/* Left wing */}
          <path
            d="M14 45 Q2 35 8 25 Q12 32 16 38"
            fill="white"
            stroke={accentColor}
            strokeWidth="0.5"
            opacity="0.6"
          />
          <path
            d="M13 48 Q0 42 5 30 Q10 38 15 42"
            fill="white"
            opacity="0.4"
          />
          {/* Right wing */}
          <path
            d="M86 45 Q98 35 92 25 Q88 32 84 38"
            fill="white"
            stroke={accentColor}
            strokeWidth="0.5"
            opacity="0.6"
          />
          <path
            d="M87 48 Q100 42 95 30 Q90 38 85 42"
            fill="white"
            opacity="0.4"
          />
        </g>
      );
    }

    // Rank 8+: cosmic circle background
    if (rank >= 8) {
      effects.push(
        <g key="cosmic" className="bao-cosmic">
          <circle cx="50" cy="45" r="46" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
          <circle cx="50" cy="45" r="42" fill="none" stroke={accentColor} strokeWidth="0.3" opacity="0.2" strokeDasharray="3 5" />
          <circle cx="50" cy="45" r="48" fill="none" stroke={accentColor} strokeWidth="0.3" opacity="0.15" strokeDasharray="1 4" />
          {/* Tiny stars in the cosmic ring */}
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

  // Aura color based on rarity would be set by parent — use accent as fallback
  const auraColor = accentColor;

  return (
    <div
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
      } as React.CSSProperties}
    >
      {/* Sparkle pseudo-elements are handled via CSS, but we add SVG sparkles for rank 2+ */}
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

      {/* Floating particles for rank 5+ */}
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

      {/* Golden border for rank 9 */}
      {rank >= 9 && <div className="bao-golden-border" aria-hidden="true" />}

      <svg
        viewBox="0 0 100 85"
        width={size}
        height={size * 0.85}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Bao character ${baoId}`}
      >
        <defs>
          {/* Base bun gradient — gives a soft 3D look */}
          <radialGradient id={`${uid}-bun-grad`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor={baseColor} stopOpacity="0" />
          </radialGradient>

          {/* Shadow beneath the bun */}
          <radialGradient id={`${uid}-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4a3728" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4a3728" stopOpacity="0" />
          </radialGradient>

          {/* Rank 4+ shimmer gradient */}
          {rank >= 4 && (
            <linearGradient id={`${uid}-shimmer`} x1="-100%" y1="0%" x2="200%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="45%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="55%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          )}

          {/* Clip path for bun shape */}
          <clipPath id={`${uid}-bun-clip`}>
            <path d="M15 70 Q15 20 50 10 Q85 20 85 70 Z" />
          </clipPath>

          {renderPatternDefs()}
        </defs>

        {/* Cosmic background for rank 8+ */}
        {renderRankEffects().filter((e) => e && (e as React.ReactElement).key === 'cosmic')}

        {/* Rank 3+ aura ring */}
        {rank >= 3 && (
          <ellipse
            cx="50"
            cy="55"
            rx="44"
            ry="30"
            fill="none"
            stroke={auraColor}
            strokeWidth="1.5"
            opacity="0.3"
            className="bao-aura-ring"
          />
        )}

        {/* Ground shadow */}
        <ellipse cx="50" cy="75" rx="30" ry="5" fill={`url(#${uid}-shadow)`} />

        {/* === THE BUN === */}
        <g className="bao-bun">
          {/* Main bun body — dome shape */}
          <path
            d="M15 70 Q15 20 50 10 Q85 20 85 70 Z"
            fill={baseColor}
            stroke={rank >= 9 ? '#fbbf24' : baseColor}
            strokeWidth={rank >= 9 ? 2 : 0.5}
            filter={pattern === 'marble' ? `url(#${uid}-pattern)` : undefined}
          />

          {/* Bottom flat base — slightly darker */}
          <rect x="15" y="67" width="70" height="6" rx="2" fill={baseColor} opacity="0.9" />
          <rect x="15" y="70" width="70" height="3" rx="1.5" fill="#00000010" />

          {/* Soft 3D highlight */}
          <path
            d="M15 70 Q15 20 50 10 Q85 20 85 70 Z"
            fill={`url(#${uid}-bun-grad)`}
          />

          {/* Top steam crease lines — gives the bun authenticity */}
          <path d="M42 15 Q50 12 58 15" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
          <path d="M38 18 Q50 14 62 18" fill="none" stroke="white" strokeWidth="0.6" opacity="0.25" />

          {/* Pattern overlay */}
          {renderPatternOverlay()}

          {/* Shimmer sweep for rank 4+ */}
          {rank >= 4 && (
            <path
              d="M15 70 Q15 20 50 10 Q85 20 85 70 Z"
              fill={`url(#${uid}-shimmer)`}
              clipPath={`url(#${uid}-bun-clip)`}
              className="bao-shimmer-sweep"
            />
          )}
        </g>

        {/* Wings behind bun for rank 7+ */}
        {renderRankEffects().filter((e) => e && (e as React.ReactElement).key === 'wings')}

        {/* Crown for rank 6+ */}
        {renderRankEffects().filter((e) => e && (e as React.ReactElement).key === 'crown')}

        {/* === THE FACE === */}
        {renderFace()}
      </svg>

      <style>{`
        .bao-art-wrapper {
          transition: transform 0.3s var(--ease-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
        }
        .bao-art-wrapper:hover {
          transform: scale(1.05);
        }

        /* Rank 1+ glow */
        .bao-glow svg {
          filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.5));
        }

        /* Rank 2+ sparkle dots */
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

        /* Rank 3+ aura ring pulse */
        .bao-aura-ring {
          animation: pulse 2.5s ease-in-out infinite;
          transform-origin: center;
        }

        /* Rank 4+ shimmer sweep */
        .bao-shimmer-sweep {
          animation: shimmer 3s linear infinite;
        }

        /* Rank 5+ floating particles */
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

        /* Rank 6+ crown bounce */
        .bao-crown {
          animation: float 2s ease-in-out infinite;
          transform-origin: center top;
        }

        /* Rank 7+ wing flutter */
        .bao-wings {
          animation: float 1.8s ease-in-out infinite alternate;
        }

        /* Rank 9 max rank golden border + rainbow glow */
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
      `}</style>
    </div>
  );
};

export default BaoArt;
