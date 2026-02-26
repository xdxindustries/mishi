import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

/**
 * LoadingSpinner — A steamer-themed loading spinner.
 * A bouncing bao with steam wisps and a spinning steamer lid ring.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 60, label }) => {
  return (
    <div
      className="loading-spinner"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
      role="status"
      aria-label={label || 'Loading'}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="spinner-bao-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8f0" />
            <stop offset="100%" stopColor="#f5e6d3" />
          </linearGradient>
        </defs>

        {/* Spinning steamer lid ring */}
        <circle
          cx="30"
          cy="30"
          r="26"
          fill="none"
          stroke="#d4a574"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="40 120"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 30 30"
            to="360 30 30"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Inner ring */}
        <circle
          cx="30"
          cy="30"
          r="20"
          fill="none"
          stroke="#deb887"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="25 100"
          opacity="0.4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 30 30"
            to="0 30 30"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Bouncing mini bao in center */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-3; 0,0"
            dur="0.8s"
            repeatCount="indefinite"
          />
          {/* Bun body */}
          <path
            d="M22 38 Q22 24 30 20 Q38 24 38 38 Z"
            fill="url(#spinner-bao-grad)"
            stroke="#e8ddd2"
            strokeWidth="0.8"
          />
          {/* Eyes */}
          <circle cx="27" cy="30" r="1.5" fill="#4a3728" />
          <circle cx="33" cy="30" r="1.5" fill="#4a3728" />
          {/* Smile */}
          <path d="M28 33 Q30 36 32 33" fill="none" stroke="#4a3728" strokeWidth="1" strokeLinecap="round" />
          {/* Blush */}
          <ellipse cx="25" cy="32.5" rx="2" ry="1" fill="#ffb3b3" opacity="0.45" />
          <ellipse cx="35" cy="32.5" rx="2" ry="1" fill="#ffb3b3" opacity="0.45" />
        </g>

        {/* Steam wisps */}
        <ellipse cx="27" cy="18" rx="2.5" ry="4" fill="white" opacity="0">
          <animate attributeName="cy" values="18;10;4" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.35;0" dur="1.5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="33" cy="16" rx="2" ry="3.5" fill="white" opacity="0">
          <animate attributeName="cy" values="16;8;2" dur="1.8s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.3;0" dur="1.8s" begin="0.4s" repeatCount="indefinite" />
        </ellipse>
      </svg>

      {label && (
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#8b7565',
            fontFamily: 'var(--font-body)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
