import React from 'react';
import { NavLink } from 'react-router-dom';

const tabs = [
  {
    to: '/pull',
    label: 'Pull',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Bamboo steamer icon */}
        <ellipse cx="12" cy="18" rx="9" ry="2.5" fill={active ? '#f97356' : '#b8a99a'} opacity="0.5" />
        <rect x="3" y="13" width="18" height="5" rx="1.5" fill={active ? '#f97356' : '#b8a99a'} opacity="0.7" />
        <ellipse cx="12" cy="13" rx="9" ry="2.5" fill={active ? '#f97356' : '#b8a99a'} />
        <path d="M3 13 Q3 8 12 5 Q21 8 21 13" fill={active ? '#f97356' : '#b8a99a'} opacity="0.6" />
        {/* Steam */}
        <path d="M10 4 Q10.5 2 11 4" stroke={active ? '#f97356' : '#b8a99a'} strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M13 3 Q13.5 1 14 3" stroke={active ? '#f97356' : '#b8a99a'} strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    ),
  },
  {
    to: '/collection',
    label: 'Collection',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Grid icon */}
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill={active ? '#f97356' : '#b8a99a'} />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill={active ? '#f97356' : '#b8a99a'} opacity="0.7" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill={active ? '#f97356' : '#b8a99a'} opacity="0.7" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill={active ? '#f97356' : '#b8a99a'} opacity="0.5" />
      </svg>
    ),
  },
  {
    to: '/playground',
    label: 'Bistro',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Restaurant/storefront icon */}
        <path d="M3 10 L12 4 L21 10" fill="none" stroke={active ? '#f97356' : '#b8a99a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="10" width="16" height="11" fill={active ? '#f97356' : '#b8a99a'} opacity="0.3" rx="1" />
        <rect x="9" y="14" width="6" height="7" fill={active ? '#f97356' : '#b8a99a'} opacity="0.6" rx="1" />
        <circle cx="13" cy="17.5" r="0.7" fill={active ? '#f97356' : '#b8a99a'} />
        <rect x="5.5" y="11.5" width="3" height="3" rx="0.5" fill={active ? '#f97356' : '#b8a99a'} opacity="0.5" />
        <rect x="15.5" y="11.5" width="3" height="3" rx="0.5" fill={active ? '#f97356' : '#b8a99a'} opacity="0.5" />
      </svg>
    ),
  },
  {
    to: '/almanac',
    label: 'Almanac',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Book icon */}
        <path d="M4 4 C4 4 4 3 6 3 L18 3 C20 3 20 4 20 4 L20 19 C20 20 19 21 18 21 L6 21 C5 21 4 20 4 19 Z" fill={active ? '#f97356' : '#b8a99a'} opacity="0.3" />
        <path d="M6 3 L6 21" stroke={active ? '#f97356' : '#b8a99a'} strokeWidth="2" />
        <rect x="8" y="6" width="8" height="2" rx="1" fill={active ? '#f97356' : '#b8a99a'} opacity="0.6" />
        <rect x="8" y="10" width="6" height="1.5" rx="0.75" fill={active ? '#f97356' : '#b8a99a'} opacity="0.4" />
      </svg>
    ),
  },
];

const Navigation: React.FC = () => {
  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          style={({ isActive }) => ({
            ...styles.tab,
            ...(isActive ? styles.tabActive : {}),
          })}
        >
          {({ isActive }) => (
            <>
              <div style={styles.iconWrap}>
                {tab.icon(isActive)}
              </div>
              <span
                style={{
                  ...styles.label,
                  color: isActive ? '#f97356' : '#8b7565',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {tab.label}
              </span>
              {isActive && <div style={styles.activeIndicator} />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '6px 0 10px',
    background: '#ffffff',
    borderTop: '1.5px solid #f0e8de',
    position: 'sticky',
    bottom: 0,
    zIndex: 100,
    boxShadow: '0 -2px 8px rgba(74, 55, 40, 0.05)',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    padding: '6px 16px 2px',
    borderRadius: '12px',
    textDecoration: 'none',
    position: 'relative' as const,
    transition: 'background 0.15s ease',
    minWidth: '64px',
  },
  tabActive: {
    background: 'rgba(249, 115, 86, 0.08)',
  },
  iconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
  },
  label: {
    fontSize: '11px',
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.2px',
    lineHeight: 1,
  },
  activeIndicator: {
    position: 'absolute' as const,
    bottom: '-2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '20px',
    height: '3px',
    borderRadius: '3px',
    background: '#f97356',
  },
};

export default Navigation;
