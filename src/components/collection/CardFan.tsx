import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { BaoDefinition, OwnedBao, BaoId } from '../../types';
import BaoCard from '../bao/BaoCard';

interface CardFanProps {
  items: Array<{ bao: BaoDefinition; owned?: OwnedBao }>;
  onCardClick?: (baoId: BaoId) => void;
  showSilhouettes?: boolean;
  size?: 'sm' | 'md' | 'lg';
  staggerReveal?: boolean;
  staggerDelay?: number;
  guaranteedIndex?: number;
  /** Cover Flow mode: one card centered, rest fanning out */
  coverflow?: boolean;
}

/**
 * CardFan — Cover Flow style carousel for BaoCards.
 * Center card is elevated and prominent, cards fan out to the sides.
 * Swipe or use arrows to browse through the collection.
 */
const CardFan: React.FC<CardFanProps> = ({
  items,
  onCardClick,
  showSilhouettes = false,
  size = 'md',
  staggerReveal = false,
  staggerDelay = 250,
  guaranteedIndex,
  coverflow = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clamp active index when items change
  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, activeIndex]);

  const navigate = useCallback((dir: -1 | 1) => {
    setActiveIndex((prev) => Math.max(0, Math.min(items.length - 1, prev + dir)));
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!coverflow) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [coverflow, navigate]);

  // Touch/mouse drag handlers
  const handleDragStart = useCallback((clientX: number) => {
    touchStartX.current = clientX;
    touchDelta.current = 0;
    isDragging.current = true;
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const delta = clientX - touchStartX.current;
    touchDelta.current = delta;
    setDragOffset(delta);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const threshold = 40;
    if (touchDelta.current < -threshold) navigate(1);
    else if (touchDelta.current > threshold) navigate(-1);
    setDragOffset(0);
    touchDelta.current = 0;
  }, [navigate]);

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);
  const onMouseMove = useCallback((e: React.MouseEvent) => handleDragMove(e.clientX), [handleDragMove]);
  const onMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd]);
  const onMouseLeave = useCallback(() => { if (isDragging.current) handleDragEnd(); }, [handleDragEnd]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => handleDragStart(e.touches[0].clientX), [handleDragStart]);
  const onTouchMove = useCallback((e: React.TouchEvent) => handleDragMove(e.touches[0].clientX), [handleDragMove]);
  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  if (items.length === 0) {
    return (
      <div style={emptyStyles.container}>
        <div style={emptyStyles.icon}>( . _ .)</div>
        <p style={emptyStyles.text}>Nothing here yet!</p>
      </div>
    );
  }

  // ---- Cover Flow mode ----
  if (coverflow) {
    return (
      <div className="coverflow-root">
        <div
          className="coverflow-viewport"
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Left arrow */}
          {activeIndex > 0 && (
            <button
              className="coverflow-arrow coverflow-arrow-prev"
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          <div className="coverflow-track">
            {items.map((item, index) => {
              const offset = index - activeIndex;
              const isActive = offset === 0;
              const absOffset = Math.abs(offset);

              // Cards far from center get hidden
              if (absOffset > 4) return null;

              // Calculate transform for each card
              const translateX = offset * 90 + (dragOffset * 0.3);
              const rotateY = offset === 0 ? 0 : offset < 0 ? 35 : -35;
              const scale = isActive ? 1.15 : Math.max(0.7, 1 - absOffset * 0.08);
              const zIndex = 100 - absOffset * 10;
              const opacity = absOffset > 3 ? 0.3 : 1;

              return (
                <div
                  key={`${item.bao.id}-${index}`}
                  className={`coverflow-item${isActive ? ' coverflow-active' : ''}`}
                  style={{
                    '--cf-tx': `${translateX}px`,
                    '--cf-ry': `${rotateY}deg`,
                    '--cf-scale': scale,
                    '--cf-z': zIndex,
                    '--cf-opacity': opacity,
                    '--card-index': index,
                  } as React.CSSProperties}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isActive && onCardClick) {
                      onCardClick(item.bao.id);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                >
                  <BaoCard
                    bao={item.bao}
                    owned={item.owned}
                    showSilhouette={showSilhouettes}
                    compact={!isActive}
                  />
                </div>
              );
            })}
          </div>

          {/* Right arrow */}
          {activeIndex < items.length - 1 && (
            <button
              className="coverflow-arrow coverflow-arrow-next"
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
              aria-label="Next"
            >
              ›
            </button>
          )}
        </div>

        {/* Name label below */}
        {items[activeIndex] && (
          <div className="coverflow-label">
            {items[activeIndex].bao.name}
          </div>
        )}

        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="coverflow-dots">
            {items.map((_, i) => (
              <button
                key={i}
                className={`coverflow-dot${i === activeIndex ? ' active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`Card ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Classic fan mode (for pull results etc) ----
  const fanData = items.map((item, index) => {
    const count = items.length;
    const midpoint = (count - 1) / 2;
    const spreadFactor = count <= 2 ? 0 : Math.min(4, 12 / Math.max(count - 1, 1));
    const rotation = count <= 2 ? 0 : Math.max(-12, Math.min(12, (index - midpoint) * spreadFactor));
    const distFromCenter = Math.abs(index - midpoint);
    const zIndex = Math.round((count - distFromCenter) * 10);
    return { item, rotation, zIndex, index };
  });

  return (
    <div className={`card-fan-container fan-${size}`}>
      {fanData.map(({ item, rotation, zIndex, index }) => {
        let className = 'card-fan-item';
        if (staggerReveal) {
          className += ' stagger-reveal';
          if (guaranteedIndex !== undefined && index === guaranteedIndex) {
            className += ' guaranteed-card';
          }
        }

        return (
          <div
            key={`${item.bao.id}-${index}`}
            className={className}
            style={{
              '--card-rotate': `${rotation}deg`,
              '--card-z': zIndex,
              '--card-index': index,
            } as React.CSSProperties}
          >
            <div className="card-fan-float">
              <BaoCard
                bao={item.bao}
                owned={item.owned}
                onClick={onCardClick ? () => onCardClick(item.bao.id) : undefined}
                showSilhouette={showSilhouettes}
                compact={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const emptyStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '12px',
  },
  icon: {
    fontSize: '32px',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
  },
  text: {
    fontSize: '15px',
    color: 'var(--color-text-light)',
    fontFamily: 'var(--font-body)',
  },
};

export default CardFan;
