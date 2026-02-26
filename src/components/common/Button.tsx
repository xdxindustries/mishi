import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'special';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tokenCost?: number;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #f97356, #ff8a6b)',
    color: 'white',
    border: '2px solid #f85d3c',
    boxShadow: '0 4px 12px rgba(249, 115, 86, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  secondary: {
    background: 'linear-gradient(135deg, #e8ddd2, #ddd0c3)',
    color: '#6b5b4e',
    border: '2px solid #d4c4b4',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
  },
  special: {
    background: 'linear-gradient(135deg, #fbbf24, #fcd34d)',
    color: '#78350f',
    border: '2px solid #f59e0b',
    boxShadow: '0 4px 14px rgba(251, 191, 36, 0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
  },
};

/**
 * Button — Styled button with kawaii aesthetics.
 * Variants: primary (coral), secondary (warm gray), special (gold).
 * Optionally shows a token cost with a coin icon.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  tokenCost,
  children,
  disabled,
  style,
  ...rest
}) => {
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        ...variantStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 22px',
        borderRadius: '14px',
        fontSize: '15px',
        fontWeight: 700,
        fontFamily: 'var(--font-body)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, opacity 0.2s ease',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        lineHeight: 1.3,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)';
        }
        rest.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        rest.onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        rest.onMouseLeave?.(e);
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            variant === 'special'
              ? '0 6px 20px rgba(251, 191, 36, 0.45), inset 0 1px 0 rgba(255,255,255,0.3)'
              : variant === 'primary'
              ? '0 6px 18px rgba(249, 115, 86, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              : '0 6px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4)';
        }
        rest.onMouseEnter?.(e);
      }}
    >
      {children}

      {tokenCost !== undefined && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            marginLeft: '2px',
            opacity: 0.9,
          }}
        >
          {/* Coin icon */}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="6" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.4" />
            <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78350f" fontFamily="sans-serif">
              T
            </text>
          </svg>
          <span style={{ fontSize: '13px' }}>{tokenCost.toLocaleString()}</span>
        </span>
      )}
    </button>
  );
};

export default Button;
