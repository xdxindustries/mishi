import React from 'react';

interface BaoSteamerProps {
  isOpen?: boolean;
  isShaking?: boolean;
  size?: number;
  wobbleIntensity?: 'normal' | 'intense';
}

/**
 * BaoSteamer — A bamboo steamer container (round, woven texture, with lid).
 * Used on the pull page. The lid animates open and the body can wobble.
 */
const BaoSteamer: React.FC<BaoSteamerProps> = ({
  isOpen = false,
  isShaking = false,
  size = 220,
  wobbleIntensity = 'normal',
}) => {
  const uid = `steamer-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div
      className={`bao-steamer${isShaking ? ' steamer-shaking' : ''}${wobbleIntensity === 'intense' ? ' steamer-intense' : ''}`}
      style={{
        width: size,
        height: size * 0.85,
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <svg
        viewBox="0 0 200 170"
        width={size}
        height={size * 0.85}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Bamboo steamer"
      >
        <defs>
          {/* Bamboo wood gradient */}
          <linearGradient id={`${uid}-bamboo`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#deb887" />
            <stop offset="30%" stopColor="#d4a574" />
            <stop offset="70%" stopColor="#c4955e" />
            <stop offset="100%" stopColor="#b8854e" />
          </linearGradient>

          {/* Lid bamboo — slightly lighter */}
          <linearGradient id={`${uid}-lid-bamboo`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8c99b" />
            <stop offset="50%" stopColor="#deb887" />
            <stop offset="100%" stopColor="#d4a574" />
          </linearGradient>

          {/* Shadow */}
          <radialGradient id={`${uid}-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4a3728" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4a3728" stopOpacity="0" />
          </radialGradient>

          {/* Woven texture pattern */}
          <pattern id={`${uid}-weave`} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="transparent" />
            <path d="M0 4 H8" stroke="#c4955e" strokeWidth="0.5" opacity="0.3" />
            <path d="M4 0 V8" stroke="#c4955e" strokeWidth="0.5" opacity="0.2" />
          </pattern>

          {/* Lid weave pattern — concentric */}
          <pattern id={`${uid}-lid-weave`} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="transparent" />
            <path d="M0 3 H6" stroke="#b8854e" strokeWidth="0.4" opacity="0.3" />
            <path d="M3 0 V6" stroke="#b8854e" strokeWidth="0.4" opacity="0.2" />
          </pattern>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="162" rx="75" ry="8" fill={`url(#${uid}-shadow)`} />

        {/* ===== STEAMER BODY ===== */}
        <g className="steamer-body">
          {/* Main body — elliptical cylinder */}
          <ellipse cx="100" cy="155" rx="75" ry="12" fill="#b8854e" />

          {/* Body walls */}
          <rect x="25" y="105" width="150" height="50" rx="2" fill={`url(#${uid}-bamboo)`} />

          {/* Woven texture on walls */}
          <rect x="25" y="105" width="150" height="50" fill={`url(#${uid}-weave)`} />

          {/* Top rim */}
          <ellipse cx="100" cy="105" rx="75" ry="12" fill="#deb887" />
          <ellipse cx="100" cy="105" rx="72" ry="10" fill="#c4955e" opacity="0.5" />

          {/* Inner shadow (the opening) */}
          <ellipse cx="100" cy="105" rx="65" ry="8" fill="#8b6f47" opacity="0.6" />
          <ellipse cx="100" cy="105" rx="60" ry="6" fill="#6b5235" opacity="0.4" />

          {/* Horizontal bamboo band detail */}
          <rect x="25" y="120" width="150" height="3" fill="#c4955e" opacity="0.4" rx="1" />
          <rect x="25" y="138" width="150" height="3" fill="#c4955e" opacity="0.4" rx="1" />

          {/* Left/right rim edges */}
          <path d="M25 105 L25 155" stroke="#b8854e" strokeWidth="1.5" opacity="0.5" />
          <path d="M175 105 L175 155" stroke="#b8854e" strokeWidth="1.5" opacity="0.5" />
        </g>

        {/* ===== STEAM WISPS (visible when closed/shaking) ===== */}
        {!isOpen && (
          <g className="steamer-steam" opacity={wobbleIntensity === 'intense' ? '0.9' : '0.5'}>
            <ellipse cx="80" cy="60" rx="6" ry="10" fill="white" opacity="0.4">
              <animate attributeName="cy" values="65;35;10" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.4;0" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="rx" values="4;7;10" dur="2.5s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="100" cy="55" rx="7" ry="12" fill="white" opacity="0.35">
              <animate attributeName="cy" values="60;28;0" dur="3s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.35;0" dur="3s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="rx" values="5;8;12" dur="3s" begin="0.5s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="120" cy="62" rx="5" ry="9" fill="white" opacity="0.3">
              <animate attributeName="cy" values="68;40;15" dur="2.8s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.3;0" dur="2.8s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="rx" values="4;6;9" dur="2.8s" begin="1s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}

        {/* ===== LID ===== */}
        <g
          className={`steamer-lid${isOpen ? ' lid-open' : ''}`}
          style={{
            transformOrigin: '100px 85px',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isOpen ? 'translateY(-45px) rotate(-15deg)' : 'translateY(0) rotate(0)',
          }}
        >
          {/* Lid dome shape */}
          <ellipse cx="100" cy="90" rx="78" ry="14" fill={`url(#${uid}-lid-bamboo)`} />

          {/* Lid top surface — dome curve */}
          <path
            d="M22 90 Q22 70 100 60 Q178 70 178 90"
            fill={`url(#${uid}-lid-bamboo)`}
          />

          {/* Woven texture on lid */}
          <path
            d="M22 90 Q22 70 100 60 Q178 70 178 90"
            fill={`url(#${uid}-lid-weave)`}
          />

          {/* Lid highlight */}
          <path
            d="M40 86 Q40 74 100 66 Q160 74 160 86"
            fill="white"
            opacity="0.12"
          />

          {/* Concentric bamboo rings on lid */}
          <ellipse cx="100" cy="82" rx="55" ry="8" fill="none" stroke="#c4955e" strokeWidth="0.6" opacity="0.35" />
          <ellipse cx="100" cy="78" rx="35" ry="5" fill="none" stroke="#c4955e" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="100" cy="74" rx="18" ry="3" fill="none" stroke="#c4955e" strokeWidth="0.5" opacity="0.25" />

          {/* Handle/knob on top */}
          <ellipse cx="100" cy="63" rx="10" ry="4" fill="#c4955e" />
          <ellipse cx="100" cy="62" rx="8" ry="3" fill="#deb887" />
          <ellipse cx="100" cy="61.5" rx="5" ry="1.5" fill="#e8c99b" opacity="0.6" />

          {/* Rim shadow */}
          <ellipse cx="100" cy="91" rx="78" ry="4" fill="#b8854e" opacity="0.3" />
        </g>
      </svg>

      <style>{`
        .bao-steamer {
          transition: transform 0.3s ease;
        }
        .steamer-shaking {
          animation: wobble 0.6s ease-in-out infinite;
        }
        .steamer-shaking .steamer-steam {
          opacity: 0.8 !important;
        }
      `}</style>
    </div>
  );
};

export default BaoSteamer;
