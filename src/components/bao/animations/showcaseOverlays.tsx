import React from 'react';
import { ShowcaseAnimationId } from '../../../config/showcaseAnimations';

interface ShowcaseOverlayProps {
  animationId: ShowcaseAnimationId | null;
  accentColor: string;
  baseColor: string;
}

/**
 * ShowcaseOverlay — Renders structural SVG elements inside BaoArt's SVG during showcase animations.
 * These provide shape context (dragon horns, phoenix wings, etc.) while ShowcaseParticles handles
 * the dynamic particle effects on a canvas layer above.
 */
const ShowcaseOverlay: React.FC<ShowcaseOverlayProps> = ({ animationId }) => {
  if (!animationId) return null;

  switch (animationId) {
    case 'dragonTransform':
      return <DragonTransformOverlay />;
    case 'phoenixWings':
      return <PhoenixWingsOverlay />;
    case 'elementalFlip':
      return <ElementalFlipOverlay />;
    default:
      return null;
  }
};

// ---- Legendary: Dragon Transform — horns, spikes, whiskers ----
const DragonTransformOverlay: React.FC = () => (
  <g className="showcase-dragon-transform">
    {/* Horns */}
    <polygon points="38,12 35,0 40,8" fill="#FFD700" opacity="0">
      <animate attributeName="opacity" values="0;0;0.8;0.8;0" dur="2.0s" begin="0s" fill="freeze" />
    </polygon>
    <polygon points="62,12 65,0 60,8" fill="#FFD700" opacity="0">
      <animate attributeName="opacity" values="0;0;0.8;0.8;0" dur="2.0s" begin="0s" fill="freeze" />
    </polygon>
    {/* Spikes along edges */}
    {[
      { x: 18, y: 40, dx: -6, dy: -2 },
      { x: 16, y: 52, dx: -7, dy: 0 },
      { x: 82, y: 40, dx: 6, dy: -2 },
      { x: 84, y: 52, dx: 7, dy: 0 },
      { x: 20, y: 60, dx: -5, dy: 3 },
      { x: 80, y: 60, dx: 5, dy: 3 },
    ].map(({ x, y, dx, dy }, i) => (
      <polygon
        key={`spike-${i}`}
        points={`${x},${y - 3} ${x + dx},${y + dy} ${x},${y + 3}`}
        fill="#B71C1C"
        opacity="0"
      >
        <animate attributeName="opacity" values="0;0;0.7;0.7;0" dur="2.0s" begin={`${i * 0.03}s`} fill="freeze" />
      </polygon>
    ))}
    {/* Whiskers */}
    <line x1="28" y1="52" x2="8" y2="48" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0">
      <animate attributeName="opacity" values="0;0;0.6;0.6;0" dur="2.0s" fill="freeze" />
    </line>
    <line x1="28" y1="55" x2="6" y2="56" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0">
      <animate attributeName="opacity" values="0;0;0.6;0.6;0" dur="2.0s" fill="freeze" />
    </line>
    <line x1="72" y1="52" x2="92" y2="48" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0">
      <animate attributeName="opacity" values="0;0;0.6;0.6;0" dur="2.0s" fill="freeze" />
    </line>
    <line x1="72" y1="55" x2="94" y2="56" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0">
      <animate attributeName="opacity" values="0;0;0.6;0.6;0" dur="2.0s" fill="freeze" />
    </line>
  </g>
);

// ---- Legendary: phoenixWings — spread wings ----
const PhoenixWingsOverlay: React.FC = () => (
  <g className="showcase-phoenix-wings">
    {/* Left wing — 3 layers */}
    <path d="M20 45 Q15 35 5 30 Q10 40 15 50 Z" fill="#FF6F00" opacity="0">
      <animate attributeName="opacity" values="0;0;0.6;0.6;0" dur="1.8s" fill="freeze" />
      <animate attributeName="d" values="M20 45 Q18 42 16 40 Q18 43 20 48 Z;M20 45 Q15 35 5 30 Q10 40 15 50 Z;M20 45 Q15 35 5 30 Q10 40 15 50 Z;M20 45 Q18 42 16 40 Q18 43 20 48 Z" dur="1.8s" fill="freeze" />
    </path>
    <path d="M22 42 Q17 32 8 25 Q13 37 18 48 Z" fill="#FFD54F" opacity="0">
      <animate attributeName="opacity" values="0;0;0.4;0.4;0" dur="1.8s" fill="freeze" />
      <animate attributeName="d" values="M22 42 Q20 39 18 37 Q20 40 22 45 Z;M22 42 Q17 32 8 25 Q13 37 18 48 Z;M22 42 Q17 32 8 25 Q13 37 18 48 Z;M22 42 Q20 39 18 37 Q20 40 22 45 Z" dur="1.8s" fill="freeze" />
    </path>
    <path d="M24 48 Q19 40 12 35 Q16 43 20 52 Z" fill="#FFA000" opacity="0">
      <animate attributeName="opacity" values="0;0;0.5;0.5;0" dur="1.8s" fill="freeze" />
      <animate attributeName="d" values="M24 48 Q22 45 20 43 Q22 46 24 50 Z;M24 48 Q19 40 12 35 Q16 43 20 52 Z;M24 48 Q19 40 12 35 Q16 43 20 52 Z;M24 48 Q22 45 20 43 Q22 46 24 50 Z" dur="1.8s" fill="freeze" />
    </path>
    {/* Right wing — mirror */}
    <path d="M80 45 Q85 35 95 30 Q90 40 85 50 Z" fill="#FF6F00" opacity="0">
      <animate attributeName="opacity" values="0;0;0.6;0.6;0" dur="1.8s" fill="freeze" />
      <animate attributeName="d" values="M80 45 Q82 42 84 40 Q82 43 80 48 Z;M80 45 Q85 35 95 30 Q90 40 85 50 Z;M80 45 Q85 35 95 30 Q90 40 85 50 Z;M80 45 Q82 42 84 40 Q82 43 80 48 Z" dur="1.8s" fill="freeze" />
    </path>
    <path d="M78 42 Q83 32 92 25 Q87 37 82 48 Z" fill="#FFD54F" opacity="0">
      <animate attributeName="opacity" values="0;0;0.4;0.4;0" dur="1.8s" fill="freeze" />
      <animate attributeName="d" values="M78 42 Q80 39 82 37 Q80 40 78 45 Z;M78 42 Q83 32 92 25 Q87 37 82 48 Z;M78 42 Q83 32 92 25 Q87 37 82 48 Z;M78 42 Q80 39 82 37 Q80 40 78 45 Z" dur="1.8s" fill="freeze" />
    </path>
    <path d="M76 48 Q81 40 88 35 Q84 43 80 52 Z" fill="#FFA000" opacity="0">
      <animate attributeName="opacity" values="0;0;0.5;0.5;0" dur="1.8s" fill="freeze" />
      <animate attributeName="d" values="M76 48 Q78 45 80 43 Q78 46 76 50 Z;M76 48 Q81 40 88 35 Q84 43 80 52 Z;M76 48 Q81 40 88 35 Q84 43 80 52 Z;M76 48 Q78 45 80 43 Q78 46 76 50 Z" dur="1.8s" fill="freeze" />
    </path>
  </g>
);

// ---- Epic: elementalFlip — ice crystals + flames (structural shapes) ----
const ElementalFlipOverlay: React.FC = () => (
  <g className="showcase-elemental">
    {/* Ice crystals left side */}
    {[{ x: 25, y: 35 }, { x: 30, y: 50 }, { x: 22, y: 55 }].map(({ x, y }, i) => (
      <polygon
        key={`ice-${i}`}
        points={`${x},${y - 5} ${x + 4},${y} ${x},${y + 5} ${x - 4},${y}`}
        fill="#81D4FA"
        stroke="#B3E5FC"
        strokeWidth="0.5"
        opacity="0"
      >
        <animate attributeName="opacity" values="0;0.7;0.7;0" dur="1.1s" begin={`${0.3 + i * 0.05}s`} fill="freeze" />
      </polygon>
    ))}
    {/* Flame paths right side */}
    {[{ x: 70, y: 35 }, { x: 75, y: 50 }, { x: 72, y: 55 }].map(({ x, y }, i) => (
      <path
        key={`fire-${i}`}
        d={`M${x} ${y + 5} Q${x - 2} ${y} ${x} ${y - 5} Q${x + 2} ${y} ${x} ${y + 5}`}
        fill="#FF5722"
        opacity="0"
      >
        <animate attributeName="opacity" values="0;0.6;0.6;0" dur="1.1s" begin={`${0.3 + i * 0.05}s`} fill="freeze" />
      </path>
    ))}
    {/* Center split line */}
    <line x1="50" y1="15" x2="50" y2="65" stroke="white" strokeWidth="1" opacity="0">
      <animate attributeName="opacity" values="0;0.5;0.5;0" dur="1.1s" begin="0.3s" fill="freeze" />
    </line>
  </g>
);

export default ShowcaseOverlay;
