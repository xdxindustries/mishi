import React from 'react';

const SPARKLE_CHARS = ['✧', '✦', '♡', '⋆', '✧', '✦', '♡', '⋆'];

const SPARKLE_POSITIONS = [
  { left: '10%', top: '20%' },
  { left: '85%', top: '15%' },
  { left: '25%', top: '70%' },
  { left: '90%', top: '60%' },
  { left: '5%', top: '45%' },
  { left: '70%', top: '80%' },
  { left: '50%', top: '10%' },
  { left: '40%', top: '90%' },
];

/**
 * BackgroundSparkles — 8 fixed-position sparkle elements
 * with staggered bgSparkleFloat animations for ambient kawaii effect.
 */
const BackgroundSparkles: React.FC = () => {
  return (
    <>
      {SPARKLE_CHARS.map((char, i) => (
        <div
          key={i}
          className="bg-sparkle"
          style={{
            left: SPARKLE_POSITIONS[i].left,
            top: SPARKLE_POSITIONS[i].top,
            animationDelay: `${i * 1.5}s`,
            color: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-primary)',
          }}
        >
          {char}
        </div>
      ))}
    </>
  );
};

export default BackgroundSparkles;
