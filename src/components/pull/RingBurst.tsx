import React from 'react';

interface RingBurstProps {
  color: string;
  ringCount?: number;
  staggerDelay?: number;
  active: boolean;
}

/**
 * RingBurst — Concentric expanding rings like Genshin Impact 5-star reveal.
 * Each ring starts at center and expands outward with fade.
 */
const RingBurst: React.FC<RingBurstProps> = ({
  color,
  ringCount = 3,
  staggerDelay = 150,
  active,
}) => {
  if (!active) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: ringCount }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: `${3 - i * 0.5}px solid ${color}`,
            animation: `ringExpand ${0.6 + i * 0.15}s ease-out forwards`,
            animationDelay: `${i * staggerDelay}ms`,
            opacity: 0,
            boxShadow: `0 0 ${10 + i * 5}px ${color}40`,
          }}
        />
      ))}
    </div>
  );
};

export default RingBurst;
