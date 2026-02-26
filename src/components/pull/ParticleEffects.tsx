import React, { useMemo } from 'react';

type EffectType = 'burst' | 'shower' | 'confetti' | 'sparkleDust';

interface ParticleEffectsProps {
  type: EffectType;
  count?: number;
  color?: string;
  active?: boolean;
}

/**
 * ParticleEffects — Renders different particle effect types using CSS animations.
 * Each type generates an array of absolutely-positioned div elements.
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
          items.push({
            id: i,
            style: {
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 6 + Math.random() * 4,
              height: 6 + Math.random() * 4,
              borderRadius: '50%',
              background: color,
              '--burst-x': `${burstX}px`,
              '--burst-y': `${burstY}px`,
              animation: `particleBurst ${0.6 + Math.random() * 0.3}s ease-out forwards`,
              animationDelay: `${i * 20}ms`,
              transform: 'translate(-50%, -50%)',
            } as React.CSSProperties,
          });
          break;
        }
        case 'shower': {
          items.push({
            id: i,
            style: {
              position: 'absolute',
              left: `${10 + Math.random() * 80}%`,
              top: `${-10 + Math.random() * 30}%`,
              width: 4 + Math.random() * 3,
              height: 4 + Math.random() * 3,
              borderRadius: '50%',
              background: color,
              opacity: 0.6 + Math.random() * 0.4,
              animation: `sparkleFall ${1.5 + Math.random() * 1}s ease-in forwards`,
              animationDelay: `${i * 80}ms`,
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
          const sparkleChars = ['✧', '✦', '⋆', '✵'];
          items.push({
            id: i,
            style: {
              position: 'absolute',
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              fontSize: `${8 + Math.random() * 8}px`,
              color: color,
              opacity: 0,
              animation: `sparkleFall ${2 + Math.random() * 1}s ease-out forwards`,
              animationDelay: `${i * 150}ms`,
              pointerEvents: 'none',
            } as React.CSSProperties,
            // Store char in a way we can use
          });
          // Override to add content via children
          items[items.length - 1] = {
            ...items[items.length - 1],
            id: i,
            // We'll handle text content in render
          };
          break;
        }
      }
    }

    return items;
  }, [type, count, color]);

  if (!active) return null;

  const sparkleChars = ['✧', '✦', '⋆', '✵'];

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
  overflow: 'hidden',
};

export default ParticleEffects;
