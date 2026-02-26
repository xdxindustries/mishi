import React from 'react';
import TokenDisplay from '../common/TokenDisplay';

interface HeaderProps {
  tokens: number;
  username: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ tokens, username, onLogout }) => {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <h1 style={styles.title}>Mishi</h1>
      </div>
      <div style={styles.right}>
        <TokenDisplay amount={tokens} />
        <button onClick={onLogout} style={styles.userChip} title="Tap to logout">
          <span style={styles.userIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3.5" fill="#8b7565" opacity="0.6" />
              <path d="M2 14.5 Q2 10 8 10 Q14 10 14 14.5" fill="#8b7565" opacity="0.4" />
            </svg>
          </span>
          <span style={styles.username}>{username}</span>
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #fff8f0, #fff1e0)',
    borderBottom: '2px solid #fde68a',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: 700,
    color: '#f97356',
    margin: 0,
    letterSpacing: '0.5px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px 4px 6px',
    borderRadius: '9999px',
    background: '#f5f0eb',
    border: '1.5px solid #e8ddd2',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    fontSize: '13px',
    fontWeight: 600,
    color: '#6b5b4e',
    fontFamily: 'var(--font-body)',
  },
  userIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    maxWidth: '80px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

export default Header;
