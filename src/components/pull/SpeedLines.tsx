import React, { useMemo } from 'react';

interface SpeedLinesProps {
  color: string;
  lineCount?: number;
  variant?: 'radial' | 'converging';
  active: boolean;
}

/**
 * SpeedLines — Manga-style radial or converging speed lines.
 * Radial: lines burst outward from center (used in glow phase).
 * Converging: lines rush inward to center (used in anticipation phase).
 */
const SpeedLines: React.FC<SpeedLinesProps> = ({
  color,
  lineCount = 28,
  variant = 'radial',
  active,
}) => {
  const lines = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => {
      const baseAngle = (360 / lineCount) * i;
      const angle = baseAngle + (Math.random() - 0.5) * 8; // slight random jitter
      const length = 60 + Math.random() * 140; // 60-200% of radius
      const width = 1 + Math.random() * 2.5;
      const opacity = 0.3 + Math.random() * 0.5;
      const delay = Math.random() * 200;
      return { id: i, angle, length, width, opacity, delay };
    });
  }, [lineCount]);

  if (!active) return null;

  const animationName = variant === 'converging' ? 'speedLineConverge' : 'speedLineFlash';
  const duration = variant === 'converging' ? '1.2s' : '0.6s';

  return (
    <svg
      viewBox="0 0 400 400"
      width="400"
      height="400"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <radialGradient id="speedline-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="30%" stopColor={color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </radialGradient>
      </defs>
      {lines.map((line) => {
        const rad = (line.angle * Math.PI) / 180;
        const cx = 200;
        const cy = 200;
        // Line starts near center, extends outward
        const innerR = variant === 'converging' ? 20 : 30;
        const outerR = innerR + line.length;
        const x1 = cx + Math.cos(rad) * innerR;
        const y1 = cy + Math.sin(rad) * innerR;
        const x2 = cx + Math.cos(rad) * outerR;
        const y2 = cy + Math.sin(rad) * outerR;

        return (
          <line
            key={line.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={line.width}
            strokeLinecap="round"
            opacity={line.opacity}
            style={{
              animation: `${animationName} ${duration} ease-out forwards`,
              animationDelay: `${line.delay}ms`,
              transformOrigin: '200px 200px',
            }}
          />
        );
      })}
    </svg>
  );
};

export default SpeedLines;
