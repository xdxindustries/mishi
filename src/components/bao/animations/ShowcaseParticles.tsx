import React, { useRef, useEffect, useCallback } from 'react';
import { ShowcaseAnimationId } from '../../../config/showcaseAnimations';

interface ShowcaseParticlesProps {
  animationId: ShowcaseAnimationId | null;
  size: number;
  active: boolean;
}

// ---- Particle types ----
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'circle' | 'heart' | 'star' | 'feather' | 'pepper' | 'spark' | 'smoke' | 'ring' | 'slash' | 'ink' | 'fire' | 'ember';
  rotation: number;
  rotationSpeed: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  growthRate?: number;
  turbulence?: number;
  startSize?: number;
}

function createParticle(overrides: Partial<Particle>): Particle {
  return {
    x: 0, y: 0, vx: 0, vy: 0,
    life: 0, maxLife: 60,
    size: 4, color: '#fff', alpha: 1,
    type: 'circle',
    rotation: 0, rotationSpeed: 0,
    ...overrides,
  };
}

// ---- Color helpers ----
function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `rgb(${rr},${rg},${rb})`;
}

// Fire color: white core → yellow → orange → red → dark red based on life progress
function fireColor(progress: number): string {
  if (progress < 0.15) return lerpColor('#FFFFFF', '#FFFFD0', progress / 0.15);
  if (progress < 0.35) return lerpColor('#FFFFD0', '#FFD700', (progress - 0.15) / 0.2);
  if (progress < 0.55) return lerpColor('#FFD700', '#FF6600', (progress - 0.35) / 0.2);
  if (progress < 0.75) return lerpColor('#FF6600', '#FF2200', (progress - 0.55) / 0.2);
  return lerpColor('#FF2200', '#660000', (progress - 0.75) / 0.25);
}

// Smoke color: light gray → darker as it ages and expands
function smokeColor(progress: number): string {
  if (progress < 0.3) return lerpColor('#AAAAAA', '#888888', progress / 0.3);
  if (progress < 0.6) return lerpColor('#888888', '#555555', (progress - 0.3) / 0.3);
  return lerpColor('#555555', '#333333', (progress - 0.6) / 0.4);
}

// ---- Draw helpers ----
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  const s = size;
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.3);
  ctx.bezierCurveTo(x - s, y + s * 0.7, x, y + s, x, y + s * 1.2);
  ctx.bezierCurveTo(x, y + s, x + s, y + s * 0.7, x + s, y + s * 0.3);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, points: number = 4) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.35;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawFeather(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.3, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.stroke();
  ctx.restore();
}

function drawPepper(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.3, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.9, size * 0.15, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---- Emitter configs per animation ----
type EmitterFn = (particles: Particle[], frame: number, w: number, h: number) => void;

const emitters: Partial<Record<ShowcaseAnimationId, EmitterFn>> = {
  // ---- Mishi ----
  megaPuppyEyes: (particles, frame, w, h) => {
    const cx = w / 2;
    const eyeY = h * 0.38;
    if (frame % 3 === 0) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2;
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * w * 0.3,
        y: eyeY + (Math.random() - 0.5) * h * 0.1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        maxLife: 40 + Math.random() * 20,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.3 ? '#FFD700' : '#FFF8DC',
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.05 + Math.random() * 0.1,
      }));
    }
    if (frame % 8 === 0) {
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * w * 0.6,
        y: h * 0.5 + Math.random() * h * 0.2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -1 - Math.random() * 1.5,
        maxLife: 50 + Math.random() * 30,
        size: 4 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#FF69B4' : '#FF1493',
        type: 'heart',
        rotation: (Math.random() - 0.5) * 0.3,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      }));
    }
    if (frame % 2 === 0) {
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * w * 0.8,
        y: eyeY + (Math.random() - 0.5) * h * 0.5,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        maxLife: 20 + Math.random() * 15,
        size: 1 + Math.random() * 2,
        color: '#FFFFFF',
        type: 'circle',
        rotation: 0, rotationSpeed: 0,
      }));
    }
  },

  heartBurst: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    if (frame < 10) {
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push(createParticle({
          x: cx + (Math.random() - 0.5) * 10,
          y: cy + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          maxLife: 40 + Math.random() * 30,
          size: 3 + Math.random() * 6,
          color: ['#FF69B4', '#FF1493', '#FF6B9D', '#E91E63'][Math.floor(Math.random() * 4)],
          type: 'heart',
          rotation: (Math.random() - 0.5) * 0.5,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
        }));
      }
    }
    if (frame % 3 === 0 && frame < 50) {
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * w * 0.6,
        y: cy + (Math.random() - 0.5) * h * 0.6,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.5 - Math.random(),
        maxLife: 20,
        size: 2 + Math.random() * 3,
        color: '#FFB6C1',
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.08,
      }));
    }
  },

  mishiWink: (particles, frame, w, h) => {
    const eyeX = w * 0.35;
    const eyeY = h * 0.42;
    if (frame % 4 === 0 && frame < 40) {
      particles.push(createParticle({
        x: eyeX + (Math.random() - 0.5) * w * 0.3,
        y: eyeY + (Math.random() - 0.5) * h * 0.2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        maxLife: 25 + Math.random() * 15,
        size: 5 + Math.random() * 8,
        color: Math.random() > 0.5 ? '#FFD700' : '#FFFACD',
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.1 + Math.random() * 0.15,
      }));
    }
    if (frame % 2 === 0 && frame < 50) {
      particles.push(createParticle({
        x: eyeX + (Math.random() - 0.5) * w * 0.4,
        y: eyeY + (Math.random() - 0.5) * h * 0.3,
        vx: 0, vy: 0,
        maxLife: 12 + Math.random() * 8,
        size: 1.5 + Math.random() * 2,
        color: '#FFD700',
        type: 'circle',
        rotation: 0, rotationSpeed: 0,
      }));
    }
  },

  // ---- Long Bao (Dragon) ----
  dragonTransform: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;

    // Dense smoke vortex — large, voluminous, visible
    // Spawn multiple smoke puffs per frame for density
    const smokeCount = frame < 15 ? 4 : 2; // Burst at start, sustain after
    for (let i = 0; i < smokeCount; i++) {
      const angle = (frame * 0.06 + i * 1.5) + Math.random() * 0.8;
      const radius = w * 0.12 + Math.random() * w * 0.22;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.65,
        vx: Math.cos(angle + Math.PI / 2) * 0.6 + (Math.random() - 0.5) * 0.4,
        vy: -0.4 - Math.random() * 0.6,
        maxLife: 55 + Math.random() * 35,
        size: 12 + Math.random() * 8,
        startSize: 12 + Math.random() * 8,
        color: '#888888', // Will be overridden by smokeColor in renderer
        alpha: 0.5 + Math.random() * 0.2,
        type: 'smoke',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        growthRate: 0.3 + Math.random() * 0.2, // Smoke expands
        turbulence: 0.3 + Math.random() * 0.3,
      }));
    }

    // Glowing embers swirling in the smoke
    if (frame % 2 === 0) {
      const angle = Math.random() * Math.PI * 2;
      const r = w * 0.05 + Math.random() * w * 0.25;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r * 0.7,
        vx: Math.cos(angle + Math.PI / 2) * 1.5,
        vy: -1 - Math.random() * 1.5,
        maxLife: 20 + Math.random() * 15,
        size: 2 + Math.random() * 3,
        color: '#FF4400',
        type: 'ember',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.1,
      }));
    }

    // Golden energy sparks — more of them, brighter
    if (frame % 3 === 0) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * w * 0.15,
        y: cy + Math.sin(angle) * h * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        maxLife: 18 + Math.random() * 8,
        size: 2 + Math.random() * 3,
        color: '#FFD700',
        type: 'spark',
        rotation: angle,
        rotationSpeed: 0,
      }));
    }
  },

  fireBreath: (particles, frame, w, h) => {
    const cx = w / 2;
    const mouthY = h * 0.55;

    // Dense fire stream — lots of particles with color aging
    if (frame > 3) {
      const count = frame < 15 ? 8 : 5; // Burst buildup then sustain
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.2;
        const baseSpeed = 2 + Math.random() * 3;
        particles.push(createParticle({
          x: cx + spread * w * 0.08,
          y: mouthY + (Math.random() - 0.5) * 3,
          vx: spread * 2.5,
          vy: -baseSpeed - Math.random() * 2,
          maxLife: 25 + Math.random() * 18,
          size: 5 + Math.random() * 8,
          startSize: 5 + Math.random() * 8,
          color: '#FFFFFF', // Will be driven by fireColor()
          type: 'fire',
          rotation: 0,
          rotationSpeed: 0,
          turbulence: 0.5 + Math.random() * 0.5,
          growthRate: -0.1, // Fire shrinks slightly as it rises
        }));
      }
    }

    // Bright ember sparks shooting off
    if (frame % 2 === 0 && frame > 5) {
      for (let i = 0; i < 2; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const speed = 3 + Math.random() * 3;
        particles.push(createParticle({
          x: cx + (Math.random() - 0.5) * w * 0.15,
          y: mouthY - Math.random() * h * 0.15,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          maxLife: 15 + Math.random() * 12,
          size: 1 + Math.random() * 2.5,
          color: '#FFFF00',
          type: 'ember',
          rotation: angle,
          rotationSpeed: 0.15,
        }));
      }
    }

    // Base glow — pulsing bright spot at mouth
    if (frame > 3 && frame % 3 === 0) {
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * 6,
        y: mouthY + (Math.random() - 0.5) * 4,
        vx: 0,
        vy: -0.5,
        maxLife: 10,
        size: 10 + Math.random() * 5,
        color: '#FFFFFF',
        alpha: 0.3,
        type: 'fire',
        rotation: 0, rotationSpeed: 0,
      }));
    }
  },

  dragonRoar: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;

    // Multiple expanding shockwave rings
    if (frame === 3 || frame === 12 || frame === 22) {
      particles.push(createParticle({
        x: cx, y: cy,
        vx: 0, vy: 0,
        maxLife: 25,
        size: 5,
        color: '#FFD700',
        type: 'ring',
        rotation: 0, rotationSpeed: 0,
        growthRate: 4,
      }));
    }

    // Dense energy sparks in all directions
    if (frame % 1 === 0 && frame < 35) {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push(createParticle({
          x: cx + (Math.random() - 0.5) * 8,
          y: cy + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          maxLife: 16 + Math.random() * 12,
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.4 ? '#FFD700' : '#FFFFFF',
          type: 'spark',
          rotation: angle,
          rotationSpeed: 0,
        }));
      }
    }

    // Fire burst from center
    if (frame > 2 && frame < 18) {
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        particles.push(createParticle({
          x: cx + (Math.random() - 0.5) * 6,
          y: cy + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          maxLife: 20 + Math.random() * 10,
          size: 4 + Math.random() * 6,
          color: '#FFFFFF',
          type: 'fire',
          rotation: 0, rotationSpeed: 0,
          turbulence: 0.3,
        }));
      }
    }
  },

  // ---- Feng Huang (Phoenix) ----
  phoenixWings: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h * 0.45;

    // Feather particles from wings
    if (frame % 2 === 0) {
      const side = Math.random() > 0.5 ? 1 : -1;
      particles.push(createParticle({
        x: cx + side * w * 0.15,
        y: cy + (Math.random() - 0.5) * h * 0.2,
        vx: side * (1.5 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 0.5 - 0.3,
        maxLife: 40 + Math.random() * 20,
        size: 5 + Math.random() * 5,
        color: ['#FF8C00', '#FFD700', '#FF6347', '#FFA500'][Math.floor(Math.random() * 4)],
        type: 'feather',
        rotation: side * 0.3 + (Math.random() - 0.5) * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
      }));
    }

    // Fire aura around the bao — warm glow particles
    if (frame % 1 === 0) {
      const angle = Math.random() * Math.PI * 2;
      const r = w * 0.1 + Math.random() * w * 0.15;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r * 0.7,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.8 - Math.random() * 0.8,
        maxLife: 18 + Math.random() * 12,
        size: 3 + Math.random() * 5,
        color: '#FFFFFF',
        type: 'fire',
        rotation: 0, rotationSpeed: 0,
        turbulence: 0.2,
      }));
    }

    // Ambient glow sparkles
    if (frame % 3 === 0) {
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * w * 0.7,
        y: cy + (Math.random() - 0.5) * h * 0.5,
        vx: 0, vy: -0.3,
        maxLife: 20 + Math.random() * 10,
        size: 2 + Math.random() * 3,
        color: '#FFD700',
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.06,
      }));
    }
  },

  featherBurst: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;

    // Explosive feather burst
    if (frame < 8) {
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 4;
        particles.push(createParticle({
          x: cx + (Math.random() - 0.5) * 10,
          y: cy + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          maxLife: 40 + Math.random() * 25,
          size: 4 + Math.random() * 6,
          color: ['#FF6347', '#FF8C00', '#FFD700', '#FFA500', '#FF4500'][Math.floor(Math.random() * 5)],
          type: 'feather',
          rotation: angle,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
        }));
      }
    }

    // Fire sparks trailing the feathers
    if (frame < 20 && frame % 1 === 0) {
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push(createParticle({
          x: cx + (Math.random() - 0.5) * w * 0.3,
          y: cy + (Math.random() - 0.5) * h * 0.3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          maxLife: 15 + Math.random() * 10,
          size: 3 + Math.random() * 4,
          color: '#FFFFFF',
          type: 'fire',
          rotation: 0, rotationSpeed: 0,
          turbulence: 0.3,
        }));
      }
    }

    // Trailing sparkles
    if (frame % 3 === 0 && frame < 50) {
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * w * 0.7,
        y: cy + (Math.random() - 0.5) * h * 0.7,
        vx: 0, vy: -0.3,
        maxLife: 15,
        size: 2 + Math.random() * 2,
        color: '#FFD700',
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.1,
      }));
    }
  },

  phoenixFlame: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const orbitR = w * 0.3;

    // Dense fire particles orbiting in a ring — lots of them
    const fireCount = 4;
    for (let i = 0; i < fireCount; i++) {
      const baseAngle = frame * 0.1 + (i / fireCount) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.6;
      const rJitter = (Math.random() - 0.5) * w * 0.06;
      particles.push(createParticle({
        x: cx + Math.cos(baseAngle + jitter) * (orbitR + rJitter),
        y: cy + Math.sin(baseAngle + jitter) * (orbitR + rJitter) * 0.6,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.8 - Math.random() * 1.2,
        maxLife: 16 + Math.random() * 10,
        size: 5 + Math.random() * 6,
        color: '#FFFFFF',
        type: 'fire',
        rotation: 0, rotationSpeed: 0,
        turbulence: 0.4,
      }));
    }

    // Ember sparks flying off tangentially
    if (frame % 3 === 0) {
      const angle = frame * 0.1;
      const tangent = angle + Math.PI / 2;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * orbitR,
        y: cy + Math.sin(angle) * orbitR * 0.6,
        vx: Math.cos(tangent) * 3.5 + (Math.random() - 0.5),
        vy: Math.sin(tangent) * 2.5 - 1,
        maxLife: 14,
        size: 1.5 + Math.random() * 2.5,
        color: '#FFFF00',
        type: 'ember',
        rotation: tangent,
        rotationSpeed: 0.2,
      }));
    }

    // Inner glow ring
    if (frame % 6 === 0) {
      particles.push(createParticle({
        x: cx, y: cy,
        vx: 0, vy: 0,
        maxLife: 15,
        size: orbitR * 0.8,
        color: '#FF6600',
        type: 'ring',
        rotation: 0, rotationSpeed: 0,
        growthRate: 0.5,
      }));
    }
  },

  // ---- Lexicon ----
  warriorStance: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    // Slash 1
    if (frame >= 8 && frame < 14) {
      const t = (frame - 8) / 6;
      const sx = cx - w * 0.35, sy = cy - h * 0.3;
      const ex = cx + w * 0.35, ey = cy + h * 0.3;
      const x = sx + (ex - sx) * t;
      const y = sy + (ey - sy) * t;
      for (let i = 0; i < 4; i++) {
        particles.push(createParticle({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          maxLife: 15 + Math.random() * 10,
          size: 2 + Math.random() * 3,
          color: '#FFFFFF',
          type: 'spark',
          rotation: Math.atan2(ey - sy, ex - sx),
          rotationSpeed: 0,
        }));
      }
    }
    // Slash 2
    if (frame >= 14 && frame < 20) {
      const t = (frame - 14) / 6;
      const sx = cx + w * 0.35, sy = cy - h * 0.3;
      const ex = cx - w * 0.35, ey = cy + h * 0.3;
      const x = sx + (ex - sx) * t;
      const y = sy + (ey - sy) * t;
      for (let i = 0; i < 4; i++) {
        particles.push(createParticle({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          maxLife: 15 + Math.random() * 10,
          size: 2 + Math.random() * 3,
          color: '#FFD700',
          type: 'spark',
          rotation: Math.atan2(ey - sy, ex - sx),
          rotationSpeed: 0,
        }));
      }
    }
    // Impact burst
    if (frame === 20) {
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        particles.push(createParticle({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          maxLife: 18 + Math.random() * 12,
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.4 ? '#FFD700' : '#FF4500',
          type: Math.random() > 0.5 ? 'spark' : 'ember',
          rotation: angle,
          rotationSpeed: 0.1,
        }));
      }
    }
  },

  calligraphyFlourish: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    if (frame % 2 === 0 && frame < 60) {
      const t = frame / 60;
      const pathX = cx + Math.sin(t * Math.PI * 3) * w * 0.25;
      const pathY = cy - h * 0.3 + t * h * 0.6;
      particles.push(createParticle({
        x: pathX + (Math.random() - 0.5) * 6,
        y: pathY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        maxLife: 30 + Math.random() * 20,
        size: 3 + Math.random() * 5,
        color: ['#1A0A0A', '#2D1B1B', '#4A2828'][Math.floor(Math.random() * 3)],
        type: 'ink',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0,
      }));
      if (frame % 4 === 0) {
        particles.push(createParticle({
          x: pathX + (Math.random() - 0.5) * 10,
          y: pathY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.3,
          maxLife: 18,
          size: 1.5 + Math.random() * 2,
          color: '#FFD700',
          type: 'star',
          rotation: Math.random() * Math.PI,
          rotationSpeed: 0.08,
        }));
      }
    }
  },

  pepperStorm: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    if (frame % 3 === 0 && frame < 60) {
      const angle = Math.random() * Math.PI * 2;
      const radius = w * 0.15 + Math.random() * w * 0.2;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.7,
        vx: 0, vy: 0,
        maxLife: 50,
        size: 4 + Math.random() * 4,
        color: ['#DC143C', '#B22222', '#FF0000', '#8B0000'][Math.floor(Math.random() * 4)],
        type: 'pepper',
        rotation: angle,
        rotationSpeed: 0.08 + Math.random() * 0.05,
        orbitAngle: angle,
        orbitRadius: radius,
        orbitSpeed: 0.06 + Math.random() * 0.03,
      }));
    }
    // Fire sparks in the vortex
    if (frame % 2 === 0) {
      const angle = Math.random() * Math.PI * 2;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * w * 0.12,
        y: cy + Math.sin(angle) * h * 0.12,
        vx: Math.cos(angle) * 2.5,
        vy: Math.sin(angle) * 2 - 1,
        maxLife: 14,
        size: 2 + Math.random() * 2,
        color: '#FF6600',
        type: 'ember',
        rotation: angle,
        rotationSpeed: 0.15,
      }));
    }
    if (frame % 5 === 0) {
      const angle = Math.random() * Math.PI * 2;
      const r = w * 0.3;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r * 0.7,
        vx: Math.cos(angle + Math.PI / 2) * 4,
        vy: Math.sin(angle + Math.PI / 2) * 3,
        maxLife: 8,
        size: 1,
        color: 'rgba(255,255,255,0.6)',
        type: 'slash',
        rotation: angle + Math.PI / 2,
        rotationSpeed: 0,
      }));
    }
  },

  // ---- Epic ----
  shadowCloak: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    // Dense dark smoke
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = w * 0.05 + Math.random() * w * 0.2;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.7,
        vx: Math.cos(angle + Math.PI / 2) * 0.5,
        vy: -0.3 - Math.random() * 0.5,
        maxLife: 40 + Math.random() * 30,
        size: 10 + Math.random() * 12,
        startSize: 10 + Math.random() * 12,
        color: '#444444',
        alpha: 0.45 + Math.random() * 0.15,
        type: 'smoke',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        growthRate: 0.25 + Math.random() * 0.15,
        turbulence: 0.2,
      }));
    }
    // Purple magical wisps
    if (frame % 3 === 0) {
      const angle = Math.random() * Math.PI * 2;
      particles.push(createParticle({
        x: cx + Math.cos(angle) * w * 0.15,
        y: cy + Math.sin(angle) * h * 0.15,
        vx: Math.cos(angle) * 1,
        vy: -0.5 - Math.random(),
        maxLife: 20 + Math.random() * 10,
        size: 3 + Math.random() * 4,
        color: '#9966FF',
        type: 'circle',
        rotation: 0, rotationSpeed: 0,
      }));
    }
  },

  rainbowShift: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'];
    if (frame % 2 === 0) {
      const colorIdx = Math.floor((frame / 8) % colors.length);
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push(createParticle({
          x: cx + (Math.random() - 0.5) * w * 0.4,
          y: cy + (Math.random() - 0.5) * h * 0.4,
          vx: Math.cos(angle) * 1,
          vy: Math.sin(angle) * 1 - 0.5,
          maxLife: 25 + Math.random() * 15,
          size: 3 + Math.random() * 4,
          color: colors[colorIdx],
          type: 'circle',
          rotation: 0, rotationSpeed: 0,
        }));
      }
    }
  },

  elementalFlip: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    // Ice crystals
    if (frame % 3 === 0) {
      particles.push(createParticle({
        x: cx - w * 0.15 - Math.random() * w * 0.15,
        y: cy + (Math.random() - 0.5) * h * 0.4,
        vx: -0.5 - Math.random(),
        vy: (Math.random() - 0.5) * 0.5,
        maxLife: 25 + Math.random() * 15,
        size: 3 + Math.random() * 4,
        color: ['#87CEEB', '#ADD8E6', '#E0FFFF', '#B0E0E6'][Math.floor(Math.random() * 4)],
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.05,
      }));
    }
    // Fire on right — use fire type for proper rendering
    if (frame % 2 === 0) {
      particles.push(createParticle({
        x: cx + w * 0.15 + Math.random() * w * 0.15,
        y: cy + (Math.random() - 0.5) * h * 0.4,
        vx: 0.5 + Math.random() * 0.5,
        vy: -0.5 - Math.random() * 0.8,
        maxLife: 18 + Math.random() * 10,
        size: 4 + Math.random() * 5,
        color: '#FFFFFF',
        type: 'fire',
        rotation: 0, rotationSpeed: 0,
        turbulence: 0.3,
      }));
    }
  },

  // ---- Rare ----
  powerUp: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    if (frame % 2 === 0 && frame < 35) {
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * w * 0.4,
        y: cy + h * 0.2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -2 - Math.random() * 2,
        maxLife: 18 + Math.random() * 10,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#FFD700' : '#FFFFFF',
        type: 'spark',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.1,
      }));
    }
    if (frame === 25) {
      particles.push(createParticle({
        x: cx, y: cy,
        vx: 0, vy: 0,
        maxLife: 20,
        size: 3,
        color: '#FFD700',
        type: 'ring',
        rotation: 0, rotationSpeed: 0,
        growthRate: 2.5,
      }));
    }
  },

  flex: (particles, frame, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    if (frame % 4 === 0 && frame < 35) {
      particles.push(createParticle({
        x: cx + (Math.random() - 0.5) * w * 0.6,
        y: cy + (Math.random() - 0.5) * h * 0.6,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        maxLife: 20 + Math.random() * 10,
        size: 4 + Math.random() * 5,
        color: Math.random() > 0.5 ? '#FFD700' : '#FFFACD',
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.08,
      }));
    }
  },
};

// ---- Main Component ----
const ShowcaseParticles: React.FC<ShowcaseParticlesProps> = ({ animationId, size, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  const canvasSize = size * 2.5; // Extra room for particles outside the bao

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Emit new particles
    const emitter = animationId ? emitters[animationId] : null;
    if (emitter) {
      emitter(particlesRef.current, frameRef.current, w, h);
    }

    // Update and draw particles
    const alive: Particle[] = [];
    for (const p of particlesRef.current) {
      p.life++;
      if (p.life >= p.maxLife) continue;

      const progress = p.life / p.maxLife;
      const fadeIn = Math.min(p.life / 4, 1);
      const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
      const currentAlpha = p.alpha * fadeIn * fadeOut;

      // Update position with optional turbulence
      if (p.orbitAngle !== undefined && p.orbitSpeed) {
        p.orbitAngle += p.orbitSpeed;
        const pcx = w / 2;
        const pcy = h / 2;
        p.x = pcx + Math.cos(p.orbitAngle) * (p.orbitRadius ?? 0);
        p.y = pcy + Math.sin(p.orbitAngle) * (p.orbitRadius ?? 0) * 0.7;
      } else {
        if (p.turbulence) {
          p.vx += (Math.random() - 0.5) * p.turbulence;
          p.vy += (Math.random() - 0.5) * p.turbulence * 0.5;
        }
        p.x += p.vx;
        p.y += p.vy;
      }
      p.rotation += p.rotationSpeed;

      // Growing/shrinking
      if (p.growthRate) {
        p.size = Math.max(0.5, p.size + p.growthRate);
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, currentAlpha);

      switch (p.type) {
        case 'fire': {
          // Fire particle with automatic color aging
          const fc = fireColor(progress);
          const baseSize = p.size;

          // Outer glow (large, soft, additive)
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowColor = fc;
          ctx.shadowBlur = baseSize * 3;
          ctx.fillStyle = fc;
          ctx.globalAlpha = currentAlpha * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseSize * 2, 0, Math.PI * 2);
          ctx.fill();

          // Core (bright, smaller)
          ctx.globalAlpha = currentAlpha * 0.8;
          ctx.shadowBlur = baseSize * 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseSize, 0, Math.PI * 2);
          ctx.fill();

          // Hot center (white-ish, very small)
          if (progress < 0.3) {
            ctx.globalAlpha = currentAlpha * (1 - progress / 0.3) * 0.7;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(p.x, p.y, baseSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'ember': {
          // Glowing ember — bright point with large glow
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          // Extra glow
          ctx.globalAlpha = currentAlpha * 0.4;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'smoke': {
          // Volumetric smoke — large soft radial gradient, semi-transparent
          const sc = smokeColor(progress);
          const smokeSize = p.size;

          // Multiple overlapping gradients for volume
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, smokeSize);
          grad.addColorStop(0, sc);
          grad.addColorStop(0.4, sc);
          grad.addColorStop(0.7, sc.replace(')', ',0.5)').replace('rgb', 'rgba'));
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.globalAlpha = currentAlpha * 0.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, smokeSize, 0, Math.PI * 2);
          ctx.fill();

          // Softer outer haze
          const grad2 = ctx.createRadialGradient(p.x, p.y, smokeSize * 0.3, p.x, p.y, smokeSize * 1.5);
          grad2.addColorStop(0, 'transparent');
          grad2.addColorStop(0.5, sc.replace(')', ',0.2)').replace('rgb', 'rgba'));
          grad2.addColorStop(1, 'transparent');
          ctx.fillStyle = grad2;
          ctx.globalAlpha = currentAlpha * 0.35;
          ctx.beginPath();
          ctx.arc(p.x, p.y, smokeSize * 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'circle': {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 2;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = currentAlpha * 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'heart': {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          drawHeart(ctx, 0, -p.size * 0.6, p.size);
          break;
        }
        case 'star': {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 3;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          drawStar(ctx, 0, 0, p.size);
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = currentAlpha * 0.3;
          drawStar(ctx, 0, 0, p.size * 1.3);
          break;
        }
        case 'feather': {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          drawFeather(ctx, p.x, p.y, p.size, p.rotation);
          break;
        }
        case 'pepper': {
          ctx.fillStyle = p.color;
          drawPepper(ctx, p.x, p.y, p.size, p.rotation);
          break;
        }
        case 'spark': {
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(-p.size * 2, 0);
          ctx.lineTo(p.size * 2, 0);
          ctx.stroke();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = currentAlpha * 0.5;
          ctx.lineWidth = 3;
          ctx.stroke();
          break;
        }
        case 'ring': {
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = currentAlpha * 0.3;
          ctx.lineWidth = 6;
          ctx.stroke();
          break;
        }
        case 'slash': {
          ctx.strokeStyle = p.color;
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(-p.size * 8, 0);
          ctx.lineTo(p.size * 8, 0);
          ctx.stroke();
          break;
        }
        case 'ink': {
          const inkGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          inkGrad.addColorStop(0, p.color);
          inkGrad.addColorStop(0.7, p.color);
          inkGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = inkGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
      alive.push(p);
    }

    particlesRef.current = alive;
    frameRef.current++;
    rafRef.current = requestAnimationFrame(render);
  }, [animationId]);

  useEffect(() => {
    if (active && animationId) {
      particlesRef.current = [];
      frameRef.current = 0;
      rafRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      particlesRef.current = [];
      frameRef.current = 0;
    };
  }, [active, animationId, render]);

  if (!active || !animationId) return null;

  const offset = (canvasSize - size) / 2;

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      style={{
        position: 'absolute',
        top: -offset,
        left: -offset,
        width: canvasSize,
        height: canvasSize,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

export default ShowcaseParticles;
