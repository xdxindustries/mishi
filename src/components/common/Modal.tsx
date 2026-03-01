import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

/**
 * Modal — Overlay modal with fade-in backdrop and scale-in content panel.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      style={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Modal'}
    >
      <div style={styles.content}>
        {/* Header */}
        {title && (
          <div style={styles.header}>
            <h2 style={styles.title}>{title}</h2>
            <button onClick={onClose} style={styles.closeBtn} aria-label="Close modal">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4L14 14M14 4L4 14" stroke="#8b7565" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Close button if no title */}
        {!title && (
          <button onClick={onClose} style={{ ...styles.closeBtn, ...styles.closeBtnAbsolute }} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="#8b7565" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Body */}
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: 'rgba(74, 55, 40, 0.4)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.25s ease-out',
  },
  content: {
    position: 'relative',
    background: '#ffffff',
    borderRadius: '20px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(74, 55, 40, 0.2), 0 4px 16px rgba(74, 55, 40, 0.1)',
    animation: 'bounceIn 0.35s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px 0 20px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#4a3728',
    fontFamily: 'var(--font-display)',
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: '#f5f0eb',
    cursor: 'pointer',
    transition: 'background 0.15s ease, transform 0.15s ease',
    padding: 0,
    flexShrink: 0,
  },
  closeBtnAbsolute: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 1,
  },
  body: {
    padding: '16px',
    overflowY: 'auto',
    maxHeight: 'calc(90vh - 60px)',
  },
};

export default Modal;
