import React from 'react';

interface TokenDisplayProps {
  amount: number;
}

/**
 * TokenDisplay — Shows the player's token count with a cute coin/token icon.
 */
const TokenDisplay: React.FC<TokenDisplayProps> = ({ amount }) => {
  return (
    <div
      className="token-display"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '9999px',
        background: 'linear-gradient(135deg, #fff8f0, #fff1e0)',
        border: '2px solid #fde68a',
        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.15)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Token coin icon */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {/* Outer coin */}
        <circle cx="12" cy="12" r="11" fill="url(#token-coin-grad)" stroke="#e5a40e" strokeWidth="1" />
        {/* Inner ring */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="#d4930d" strokeWidth="0.7" opacity="0.4" />
        {/* Star/sparkle in center */}
        <polygon
          points="12,5.5 13.5,10 18,10 14.5,12.8 15.8,17 12,14.5 8.2,17 9.5,12.8 6,10 10.5,10"
          fill="#b8860b"
          opacity="0.5"
        />
        {/* Highlight */}
        <ellipse cx="9" cy="8" rx="3.5" ry="2" fill="white" opacity="0.25" transform="rotate(-20, 9, 8)" />
        <defs>
          <linearGradient id="token-coin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>

      {/* Amount */}
      <span
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#78350f',
          letterSpacing: '0.3px',
          lineHeight: 1,
        }}
      >
        {amount.toLocaleString()}
      </span>
    </div>
  );
};

export default TokenDisplay;
