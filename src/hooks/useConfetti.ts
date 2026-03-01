import confetti from 'canvas-confetti';
import { useCallback } from 'react';

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function useConfetti() {
  const fireBurst = useCallback((color: string, count: number) => {
    // Center explosion with stars and circles
    confetti({
      particleCount: Math.floor(count * 0.6),
      spread: 100,
      startVelocity: 50,
      colors: [color, lighten(color, 60), '#ffffff'],
      origin: { x: 0.5, y: 0.5 },
      shapes: ['star', 'circle'],
      ticks: 80,
      gravity: 0.8,
      scalar: 1.2,
    });
    // Second wave slightly delayed with wider spread
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(count * 0.4),
        spread: 160,
        startVelocity: 35,
        colors: [color, '#ffffff', lighten(color, 80)],
        origin: { x: 0.5, y: 0.5 },
        shapes: ['circle'],
        ticks: 60,
        gravity: 1,
        scalar: 0.8,
      });
    }, 100);
  }, []);

  const fireShower = useCallback((color: string, count: number) => {
    // Gentle rain from above
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 270,
        spread: 50,
        startVelocity: 15,
        colors: [color, lighten(color, 40), '#ffffff'],
        origin: { x: Math.random(), y: -0.05 },
        shapes: ['circle'],
        ticks: 100,
        gravity: 0.5,
        drift: (Math.random() - 0.5) * 0.5,
        scalar: 0.6,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const fireCelebration = useCallback((color: string) => {
    // Big celebration burst for settle phase
    const count = 80;
    const defaults = {
      origin: { y: 0.6 },
      colors: [color, lighten(color, 40), lighten(color, 80), '#ffffff', '#ffd700'],
      ticks: 100,
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.5),
      spread: 60,
      startVelocity: 55,
      shapes: ['star'],
      scalar: 1.4,
    });
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.3),
      spread: 100,
      startVelocity: 40,
      shapes: ['circle'],
      scalar: 0.8,
    });
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.2),
      spread: 130,
      startVelocity: 30,
      shapes: ['circle'],
      scalar: 0.6,
    });
  }, []);

  return { fireBurst, fireShower, fireCelebration };
}
