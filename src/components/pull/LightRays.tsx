import React, { useMemo } from 'react';

interface LightRaysProps {
  color?: string;
  rayCount?: number;
  spinning?: boolean;
}

/**
 * LightRays — Renders spinning radial light rays from center.
 * Each ray is a thin div with a gradient, evenly distributed around 360 degrees.
 */
const LightRays: React.FC<LightRaysProps> = ({
  color = '#fbbf24',
  rayCount = 8,
  spinning = true,
}) => {
  const rays = useMemo(() => {
    const items: Array<{ angle: number; id: number }> = [];
    for (let i = 0; i < rayCount; i++) {
      items.push({ angle: (360 / rayCount) * i, id: i });
    }
    return items;
  }, [rayCount]);

  return (
    <div
      style={{
        ...containerStyle,
        animation: spinning ? 'raysSpin 8s linear infinite' : undefined,
      }}
    >
      {rays.map((ray) => (
        <div
          key={ray.id}
          style={{
            position: 'absolute',
            width: 3,
            height: 120,
            background: `linear-gradient(to top, ${color}, transparent)`,
            top: '50%',
            left: '50%',
            transformOrigin: 'bottom center',
            transform: `translate(-50%, -100%) rotate(${ray.angle}deg)`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

export default LightRays;
