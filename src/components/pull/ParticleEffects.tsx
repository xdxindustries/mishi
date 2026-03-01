import React, { useMemo } from 'react';

type EffectType = 'burst' | 'shower' | 'confetti' | 'sparkleDust';

interface ParticleEffectsProps {
  type: EffectType;
  count?: number;
  color?: string;
  active?: boolean;
}

const sparkleChars = ['✧', '✦', '⋆', '✵', '★', '☆'];

/**
 * ParticleEffects — Renders different particle effect types using CSS animations.
 * - burst: radial explosion with diamond shapes
 * - shower: diamond-shaped particles falling with rotation
 * - confetti: colorful rectangles falling
 * - sparkleDust: twinkle characters with scale+rotate
 */
const ParticleEffects: React.FC<ParticleEffectsProps> = ({
  type,
  count = 12,
  color = '#fbbf24',
  active = true,
}) => {
  const particles = useMemo(() => {
    const items: Array<{
      id: number;
      style: React.CSSProperties;
    }> = [];

    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const radians = (angle * Math.PI) / 180;
      const distance = 60 + Math.random() * 80;

      switch (type) {
        case 'burst': {
          const burstX = Math.cos(radians) * distance;
          const burstY = Math.sin(radians) * distance;
          const size = 6 + Math.random() * 6;
          const isDiamond = i % 3 !== 0;
          items.push({
            id: i,
            style: {
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: size,
              height: size,
              borderRadius: isDiamond ? '2px' : '50%',
              background: i % 4 === 0 ? 'white' : color,
              clipPath: isDiamond ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : undefined,
              '--burst-x': `${burstX}px`,
              '--burst-y': `${burstY}px`,
              animation: `particleBurst ${0.5 + Math.random() * 0.4}s ease-out forwards`,
              animationDelay: `${i * 15}ms`,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${4 + Math.random() * 4}px ${color}80`,
            } as React.CSSProperties,
          });
          break;
        }
        case 'shower': {
          const size = 4 + Math.random() * 4;
          const isDiamond = i % 2 === 0;
          items.push({
            id: i,
            style: {
              position: 'absolute',
              left: `${5 + Math.random() * 90}%`,
              top: `${-10 + Math.random() * 25}%`,
              width: size,
              height: size,
              borderRadius: isDiamond ? '1px' : '50%',
              background: i % 3 === 0 ? 'white' : color,
              clipPath: isDiamond ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : undefined,
              opacity: 0.5 + Math.random() * 0.5,
              animation: `sparkleFall ${1.2 + Math.random() * 1.2}s ease-in forwards`,
              animationDelay: `${i * 60}ms`,
              boxShadow: `0 0 3px ${color}60`,
            } as React.CSSProperties,
          });
          break;
        }
        case 'confetti': {
          const confettiColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
          items.push({
            id: i,
            style: {
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: '-10px',
              width: 8,
              height: 8,
              borderRadius: '2px',
              background: confettiColors[i % confettiColors.length],
              animation: `confettiFall ${2 + Math.random() * 1.5}s ease-in forwards`,
              animationDelay: `${i * 100}ms`,
            } as React.CSSProperties,
          });
          break;
        }
        case 'sparkleDust': {
          items.push({
            id: i,
            style: {
              position: 'absolute',
              left: `${15 + Math.random() * 70}%`,
              top: `${30 + Math.random() * 50}%`,
              fontSize: `${10 + Math.random() * 10}px`,
              color: i % 3 === 0 ? 'white' : color,
              opacity: 0,
              animation: `sparkleTwinkle ${1.5 + Math.random() * 1}s ease-out forwards`,
              animationDelay: `${i * 120}ms`,
              pointerEvents: 'none',
              textShadow: `0 0 6px ${color}`,
              filter: `drop-shadow(0 0 3px ${color})`,
            } as React.CSSProperties,
          });
          break;
        }
      }
    }

    return items;
  }, [type, count, color]);

  if (!active) return null;

  return (
    <div style={containerStyle}>
      {particles.map((p) => (
        <div key={p.id} style={p.style}>
          {type === 'sparkleDust' ? sparkleChars[p.id % sparkleChars.length] : null}
        </div>
      ))}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'visible',
};

export default ParticleEffects;
