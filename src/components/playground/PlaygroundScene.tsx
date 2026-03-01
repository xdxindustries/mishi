import React, { useRef, useState, useEffect, useCallback } from 'react';
import { OwnedBao } from '../../types';
import IsometricScene from './IsometricScene';
import PlaygroundBao from './PlaygroundBao';
import { usePlaygroundSimulation } from './usePlaygroundSimulation';
import { SCENE_W, SCENE_H } from './isoUtils';

interface PlaygroundSceneProps {
  ownedBaos: OwnedBao[];
}

const PlaygroundScene: React.FC<PlaygroundSceneProps> = ({ ownedBaos }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeBaos, handleBaoTap, speedUpArrival } = usePlaygroundSimulation(ownedBaos);
  const [scale, setScale] = useState(1);

  const computeScale = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const availW = rect.width;
    const availH = rect.height;
    if (availW === 0 || availH === 0) return;

    const scaleW = availW / SCENE_W;
    const scaleH = availH / SCENE_H;

    // Fill height (important for portrait phones), but cap so we don't
    // clip more than 30% of the width (walls are expendable, furniture isn't)
    const maxScale = (availW * 1.6) / SCENE_W;
    const newScale = Math.max(scaleW, Math.min(scaleH, maxScale));

    setScale(Math.max(newScale, 0.5));
  }, []);

  useEffect(() => {
    computeScale();
    window.addEventListener('resize', computeScale);
    const orientHandler = () => setTimeout(computeScale, 100);
    window.addEventListener('orientationchange', orientHandler);
    return () => {
      window.removeEventListener('resize', computeScale);
      window.removeEventListener('orientationchange', orientHandler);
    };
  }, [computeScale]);

  const sceneW = SCENE_W * scale;
  const sceneH = SCENE_H * scale;

  return (
    <div ref={containerRef} style={styles.viewport} className="playground-viewport">
      <div
        style={{
          position: 'absolute',
          width: `${sceneW}px`,
          height: `${sceneH}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <IsometricScene />

        <div style={styles.baosLayer}>
          {activeBaos.map((bao) => (
            <PlaygroundBao
              key={bao.instanceId}
              state={bao}
              onTap={() => handleBaoTap(bao.instanceId)}
              scale={scale}
            />
          ))}
        </div>

        <div
          style={styles.counterTapArea}
          onClick={speedUpArrival}
          title="Ring the bell!"
        />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  viewport: {
    position: 'relative',
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    // Match the wall fill colors so overflow blends seamlessly
    background: '#DBC8B2',
  },
  baosLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  counterTapArea: {
    position: 'absolute',
    left: '30%',
    top: '15%',
    width: '40%',
    height: '10%',
    cursor: 'pointer',
    zIndex: 10,
  },
};

export default PlaygroundScene;
