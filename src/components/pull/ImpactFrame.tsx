import React, { useMemo } from 'react';
import { Rarity } from '../../types';

interface ImpactFrameProps {
  color: string;
  rarity: Rarity;
  active: boolean;
}

/**
 * ImpactFrame — Manga-style starburst impact overlay.
 * Creates a dramatic spiky star with expanding ring(s) for the flash phase.
 * Rarity determines intensity: more points, more rings, epic lightning bolts.
 */
const ImpactFrame: React.FC<ImpactFrameProps> = ({ color, rarity, active }) => {
  const isLegendary = rarity === Rarity.Legendary;
  const isEpic = rarity === Rarity.Epic;

  // Generate starburst polygon points
  const starPoints = useMemo(() => {
    const points = isLegendary ? 16 : isEpic ? 14 : 12;
    const cx = 200;
    const cy = 200;
    const outerR = 190;
    const innerR = isLegendary ? 40 : isEpic ? 50 : 60;
    const coords: string[] = [];

    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI * i) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const jitter = i % 2 === 0 ? (Math.random() - 0.5) * 20 : 0;
      coords.push(`${cx + Math.cos(angle) * (r + jitter)},${cy + Math.sin(angle) * (r + jitter)}`);
    }
    return coords.join(' ');
  }, [isLegendary, isEpic]);

  // Lightning bolt paths for Epic
  const bolts = useMemo(() => {
    if (!isEpic) return [];
    return [0, 72, 144, 216, 288].map((baseAngle) => {
      const rad = (baseAngle * Math.PI) / 180;
      const cx = 200;
      const cy = 200;
      const x1 = cx + Math.cos(rad) * 30;
      const y1 = cy + Math.sin(rad) * 30;
      const x2 = cx + Math.cos(rad) * 80 + (Math.random() - 0.5) * 30;
      const y2 = cy + Math.sin(rad) * 80 + (Math.random() - 0.5) * 30;
      const x3 = cx + Math.cos(rad) * 60 + (Math.random() - 0.5) * 20;
      const y3 = cy + Math.sin(rad) * 60 + (Math.random() - 0.5) * 20;
      const x4 = cx + Math.cos(rad) * 140;
      const y4 = cy + Math.sin(rad) * 140;
      return `M${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4}`;
    });
  }, [isEpic]);

  if (!active) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10002,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Starburst */}
      <svg
        viewBox="0 0 400 400"
        style={{
          position: 'absolute',
          width: '100vmin',
          height: '100vmin',
          animation: 'starburstPop 0.5s ease-out forwards',
        }}
      >
        <defs>
          <radialGradient id="impact-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="40%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id="impact-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon
          points={starPoints}
          fill="url(#impact-grad)"
          filter="url(#impact-glow)"
        />
        {/* Epic lightning bolts */}
        {bolts.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            opacity="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#impact-glow)"
          />
        ))}
      </svg>

      {/* Expanding ring(s) */}
      <div
        style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          animation: 'ringExpand 0.7s ease-out forwards',
          opacity: 0.8,
        }}
      />
      {(isEpic || isLegendary) && (
        <div
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `2px solid white`,
            animation: 'ringExpand 0.8s ease-out forwards',
            animationDelay: '100ms',
            opacity: 0.6,
          }}
        />
      )}
      {isLegendary && (
        <div
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            animation: 'ringExpand 0.9s ease-out forwards',
            animationDelay: '200ms',
            opacity: 0.4,
          }}
        />
      )}
    </div>
  );
};

export default ImpactFrame;
