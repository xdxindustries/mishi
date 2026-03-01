import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import BaoArt from '../bao/BaoArt';
import { PlaygroundBaoState } from './usePlaygroundSimulation';
import { ACTIVITY_CONFIG } from './activities';

interface PlaygroundBaoProps {
  state: PlaygroundBaoState;
  onTap: () => void;
  /** Scale factor: scene pixels to viewport pixels */
  scale: number;
}

const BAO_SIZE = 32;

const PlaygroundBao: React.FC<PlaygroundBaoProps> = ({ state, onTap, scale }) => {
  const motionX = useMotionValue(state.x * scale);
  const motionY = useMotionValue(state.y * scale);
  // Soft spring for smooth walking — lower stiffness = gentler movement
  const springX = useSpring(motionX, { stiffness: 30, damping: 20, mass: 1.2 });
  const springY = useSpring(motionY, { stiffness: 30, damping: 20, mass: 1.2 });

  // Track previous target to detect movement
  const prevTargetRef = useRef({ x: state.x, y: state.y });

  useEffect(() => {
    if (state.activity === 'entering') {
      // Gentle hop in near the door
      motionX.set(state.targetX * scale);
      motionY.set(state.targetY * scale);
    } else if (state.activity === 'walking' || state.activity === 'leaving') {
      // Smooth walk to target position
      motionX.set(state.targetX * scale);
      motionY.set(state.targetY * scale);
    } else if (state.x !== prevTargetRef.current.x || state.y !== prevTargetRef.current.y) {
      // Snap for stationary activities
      motionX.set(state.x * scale);
      motionY.set(state.y * scale);
    }
    prevTargetRef.current = { x: state.x, y: state.y };
  }, [state.activity, state.x, state.y, state.targetX, state.targetY, scale, motionX, motionY]);

  const config = ACTIVITY_CONFIG[state.activity];
  const opacity = state.activity === 'entering' || state.activity === 'leaving' ? 0.9 : 1;

  // Render activity overlay (speech bubbles, food, Zzz, etc.)
  const renderActivityOverlay = () => {
    switch (state.activity) {
      case 'eating':
        return (
          <div style={styles.overlay}>
            <span style={styles.foodEmoji}>🍜</span>
          </div>
        );
      case 'chatting':
        return (
          <div style={styles.chatBubble} className="playground-chat-bubble">
            <span>{['♪', '♡', '!', '★', '~'][Math.floor(Math.random() * 5)]}</span>
          </div>
        );
      case 'cooking':
        return (
          <div style={styles.overlay}>
            <span style={styles.chefHat}>👨‍🍳</span>
          </div>
        );
      case 'sleeping':
        return (
          <div style={styles.zzzContainer} className="playground-zzz">
            <span style={styles.zzz}>z</span>
            <span style={{ ...styles.zzz, animationDelay: '0.5s', left: '60%' }}>z</span>
            <span style={{ ...styles.zzz, animationDelay: '1s', fontSize: '10px', left: '70%' }}>z</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        x: springX,
        y: springY,
        width: BAO_SIZE,
        height: BAO_SIZE,
        marginLeft: -BAO_SIZE / 2,
        marginTop: -BAO_SIZE,
        opacity,
        transform: state.facingRight ? 'scaleX(1)' : 'scaleX(-1)',
        zIndex: Math.round(state.y + (state.activity === 'cooking' ? -50 : 0)),
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      onClick={onTap}
      whileTap={{ scale: 0.9 }}
    >
      {/* Isometric ground shadow */}
      <div style={styles.shadow} />
      <BaoArt
        baoId={state.bao.id}
        baseColor={state.bao.baseColor}
        accentColor={state.bao.accentColor}
        pattern={state.bao.pattern}
        faceExpression={state.activity === 'sleeping' ? 'sleepy' : state.bao.faceExpression}
        rank={state.owned.rank}
        size={BAO_SIZE}
        idleAnimation={config.idleAnimation}
      />
      {renderActivityOverlay()}
    </motion.div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  shadow: {
    position: 'absolute',
    bottom: '-2px',
    left: '50%',
    transform: 'translateX(-50%) scaleY(0.4)',
    width: `${BAO_SIZE * 0.65}px`,
    height: `${BAO_SIZE * 0.3}px`,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.15)',
    filter: 'blur(3px)',
    pointerEvents: 'none',
  },
  overlay: {
    position: 'absolute',
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
  },
  foodEmoji: {
    fontSize: '14px',
    display: 'block',
  },
  chefHat: {
    fontSize: '12px',
    position: 'absolute',
    top: '-18px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  chatBubble: {
    position: 'absolute',
    top: '-20px',
    right: '-8px',
    background: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '11px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    pointerEvents: 'none',
    animation: 'bounceIn 0.3s ease-out, fadeOut 2s ease-in forwards',
    animationDelay: '0s, 3s',
  },
  zzzContainer: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    width: '30px',
    height: '30px',
    pointerEvents: 'none',
  },
  zzz: {
    position: 'absolute',
    fontSize: '12px',
    fontWeight: 700,
    color: '#8b7565',
    fontFamily: 'var(--font-body)',
    opacity: 0,
    animation: 'floatUp 2.5s ease-out infinite',
    left: '50%',
  },
};

export default PlaygroundBao;
