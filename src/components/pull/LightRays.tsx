import React, { useMemo } from 'react';

interface LightRaysProps {
  color?: string;
  rayCount?: number;
  spinning?: boolean;
}

/**
 * LightRays — Dramatic tapered light rays radiating from center.
 * Uses clipPath triangles with variable width/length/opacity for depth.
 * Dual-layer: thick slow-spinning rays + thin fast-spinning accent rays.
 */
const LightRays: React.FC<LightRaysProps> = ({
  color = '#fbbf24',
  rayCount = 8,
  spinning = true,
}) => {
  const primaryRays = useMemo(() => {
    return Array.from({ length: rayCount }, (_, i) => ({
      id: i,
      angle: (360 / rayCount) * i + (Math.random() - 0.5) * 4,
      length: 100 + Math.random() * 80,
      width: 12 + Math.random() * 14,
      opacity: 0.25 + Math.random() * 0.35,
      pulseDelay: (i * 0.3) % 2,
    }));
  }, [rayCount]);

  const accentRays = useMemo(() => {
    const accentCount = Math.max(4, Math.floor(rayCount * 0.6));
    return Array.from({ length: accentCount }, (_, i) => ({
      id: i,
      angle: (360 / accentCount) * i + 15, // offset from primary
      length: 70 + Math.random() * 50,
      width: 4 + Math.random() * 6,
      opacity: 0.12 + Math.random() * 0.18,
    }));
  }, [rayCount]);

  return (
    <div style={containerStyle}>
      {/* Primary rays — thick, slow spin */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          animation: spinning ? 'raysSpin 12s linear infinite' : undefined,
        }}
      >
        {primaryRays.map((ray) => (
          <div
            key={ray.id}
            style={{
              position: 'absolute',
              width: ray.width,
              height: ray.length,
              background: `linear-gradient(to top, ${color}90, ${color}30, transparent)`,
              clipPath: 'polygon(50% 100%, 15% 0%, 85% 0%)',
              top: '50%',
              left: '50%',
              transformOrigin: `${ray.width / 2}px ${ray.length}px`,
              transform: `translate(-${ray.width / 2}px, -${ray.length}px) rotate(${ray.angle}deg)`,
              opacity: ray.opacity,
              animation: `rayPulse ${1.8 + ray.pulseDelay}s ease-in-out infinite`,
              animationDelay: `${ray.pulseDelay}s`,
              '--ray-base-opacity': `${ray.opacity}`,
              '--ray-peak-opacity': `${Math.min(1, ray.opacity + 0.35)}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Accent rays — thinner, faster counter-spin for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          animation: spinning ? 'raysSpin 18s linear infinite reverse' : undefined,
          opacity: 0.5,
        }}
      >
        {accentRays.map((ray) => (
          <div
            key={ray.id}
            style={{
              position: 'absolute',
              width: ray.width,
              height: ray.length,
              background: `linear-gradient(to top, ${color}60, transparent)`,
              clipPath: 'polygon(50% 100%, 25% 0%, 75% 0%)',
              top: '50%',
              left: '50%',
              transformOrigin: `${ray.width / 2}px ${ray.length}px`,
              transform: `translate(-${ray.width / 2}px, -${ray.length}px) rotate(${ray.angle}deg)`,
              opacity: ray.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

export default LightRays;
