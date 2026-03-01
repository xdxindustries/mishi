import React from 'react';
import {
  SCENE_W,
  SCENE_H,
  TILE_W,
  TILE_H,
  DEPTH_MIN,
  DEPTH_MAX,
  CORRIDOR_WIDTH,
  gridToScreen,
  getFloorTiles,
  tileColor,
  tileDiamond,
} from './isoUtils';

/**
 * IsometricScene — Diagonal restaurant for the Bao Bistro.
 * Portrait-optimized with narrow tiles and extended depth.
 */
const IsometricScene: React.FC = () => {
  const floorTiles = getFloorTiles();

  // Calculate wall edge points for the corridor
  const leftEdge: Array<{x: number; y: number}> = [];
  const rightEdge: Array<{x: number; y: number}> = [];

  for (let depth = DEPTH_MIN; depth <= DEPTH_MAX; depth++) {
    let minCol = Infinity, maxCol = -Infinity;
    for (let col = 0; col <= depth; col++) {
      const row = depth - col;
      if (col < 0 || row < 0) continue;
      if (Math.abs(col - row) > CORRIDOR_WIDTH) continue;
      if (col < minCol) minCol = col;
      if (col > maxCol) maxCol = col;
    }
    const leftRow = depth - minCol;
    const rightRow = depth - maxCol;
    const lp = gridToScreen(minCol, leftRow);
    const rp = gridToScreen(maxCol, rightRow);
    leftEdge.push({ x: lp.x - TILE_W / 2, y: lp.y });
    rightEdge.push({ x: rp.x + TILE_W / 2, y: rp.y });
  }

  // Top diamond point
  const topTile = gridToScreen(0, 1);
  const topY = topTile.y - TILE_H / 2;

  const wallH = 28;

  return (
    <svg
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="iso-wall-left" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F0DFC9" />
          <stop offset="100%" stopColor="#FFE8CC" />
        </linearGradient>
        <linearGradient id="iso-wall-right" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#E2D1BB" />
          <stop offset="100%" stopColor="#EFE0CF" />
        </linearGradient>
      </defs>

      {/* Warm background — matches page background for seamless blend */}
      <rect width={SCENE_W} height={SCENE_H} fill="#DBC8B2" />

      {/* ===== WALLS filling left and right areas ===== */}
      <polygon
        points={`0,0 ${SCENE_W / 2},0 ${topTile.x},${topY} ${leftEdge.map(p => `${p.x},${p.y}`).join(' ')} 0,${SCENE_H}`}
        fill="#E8D5BD"
      />
      <polygon
        points={`${SCENE_W},0 ${SCENE_W / 2},0 ${topTile.x},${topY} ${rightEdge.map(p => `${p.x},${p.y}`).join(' ')} ${SCENE_W},${SCENE_H}`}
        fill="#DBC8B2"
      />

      {/* ===== BACK WALL (raised panel behind kitchen) ===== */}
      <BackWall leftEdge={leftEdge} rightEdge={rightEdge} topTile={topTile} topY={topY} wallH={wallH} />

      {/* ===== FLOOR TILES ===== */}
      {floorTiles.map(({ col, row }) => (
        <polygon
          key={`f-${col}-${row}`}
          points={tileDiamond(col, row)}
          fill={tileColor(col, row)}
          stroke="#B8945E"
          strokeWidth="0.4"
          strokeOpacity="0.3"
        />
      ))}

      {/* ===== WALL TRIM ===== */}
      <WallTrim leftEdge={leftEdge} rightEdge={rightEdge} wallH={wallH} />

      {/* ===== FURNITURE (depth-sorted) ===== */}

      {/* Kitchen area — depth 2 */}
      <IsoBox col={1} row={1} h={10} top="#5A4535" front="#4a3728" side="#3d2d1f" />
      <IsoSteamer col={1} row={1} offsetX={-4} />
      <IsoSteamer col={1} row={1} offsetX={4} />

      {/* Counter bar — depth 3-4 */}
      <IsoBox col={2} row={1} h={8} top="#8B6D4C" front="#6B5440" side="#5A4535" />
      <IsoBox col={1} row={2} h={8} top="#8B6D4C" front="#6B5440" side="#5A4535" />
      <IsoBox col={2} row={2} h={8} top="#8B6D4C" front="#6B5440" side="#5A4535" />

      {/* Counter stools */}
      <IsoStool col={3} row={1} />
      <IsoStool col={1} row={3} />

      {/* Condiments and teapot */}
      <Condiment col={2.2} row={1.4} />
      <Teapot col={1.5} row={2.3} />

      {/* Table A — depth 5, adjacent seats */}
      <IsoRoundTable col1={2} row1={3} col2={3} row2={2} />

      {/* Table B — depth 7, adjacent seats */}
      <IsoRoundTable col1={3} row1={4} col2={4} row2={3} />

      {/* Booth — depth 8-9 */}
      <IsoBooth col1={3} row1={5} col2={4} row2={4} />

      {/* Door — depth 10 */}
      <DoorFrame />
      <IsoMat col={5} row={5} />

      {/* Wall decorations */}
      <WallDecorations leftEdge={leftEdge} rightEdge={rightEdge} wallH={wallH} />
    </svg>
  );
};

// ===== BACK WALL =====

function BackWall({ leftEdge, rightEdge, topTile, topY, wallH }: {
  leftEdge: Array<{x: number; y: number}>;
  rightEdge: Array<{x: number; y: number}>;
  topTile: {x: number; y: number}; topY: number;
  wallH: number;
}) {
  // Raised wall behind kitchen/counter (first 3 depth levels)
  const panelCount = Math.min(3, leftEdge.length - 1);

  return (
    <g>
      {/* Back wall V-shape at top */}
      <polygon
        points={`${leftEdge[0].x},${leftEdge[0].y} ${topTile.x},${topY} ${rightEdge[0].x},${rightEdge[0].y} ${rightEdge[0].x},${rightEdge[0].y - wallH} ${topTile.x},${topY - wallH} ${leftEdge[0].x},${leftEdge[0].y - wallH}`}
        fill="#FFF0E0"
        stroke="#E0D0BC"
        strokeWidth="0.3"
      />
      {/* Left wall panels */}
      {Array.from({ length: panelCount }, (_, i) => (
        <polygon
          key={`bwl-${i}`}
          points={`${leftEdge[i].x},${leftEdge[i].y} ${leftEdge[i + 1].x},${leftEdge[i + 1].y} ${leftEdge[i + 1].x},${leftEdge[i + 1].y - wallH} ${leftEdge[i].x},${leftEdge[i].y - wallH}`}
          fill="#FFE8CC"
          stroke="#E0D0BC"
          strokeWidth="0.3"
        />
      ))}
      {/* Right wall panels */}
      {Array.from({ length: panelCount }, (_, i) => (
        <polygon
          key={`bwr-${i}`}
          points={`${rightEdge[i].x},${rightEdge[i].y} ${rightEdge[i + 1].x},${rightEdge[i + 1].y} ${rightEdge[i + 1].x},${rightEdge[i + 1].y - wallH} ${rightEdge[i].x},${rightEdge[i].y - wallH}`}
          fill="#F5E6D3"
          stroke="#E0D0BC"
          strokeWidth="0.3"
        />
      ))}
    </g>
  );
}

// ===== WALL TRIM =====

function WallTrim({ leftEdge, rightEdge, wallH }: {
  leftEdge: Array<{x: number; y: number}>;
  rightEdge: Array<{x: number; y: number}>;
  wallH: number;
}) {
  const panelCount = Math.min(4, leftEdge.length);
  const leftStripe = leftEdge.slice(0, panelCount).map(p => `${p.x},${p.y - wallH * 0.5}`).join(' ');
  const rightStripe = rightEdge.slice(0, panelCount).map(p => `${p.x},${p.y - wallH * 0.5}`).join(' ');

  return (
    <g>
      <polyline points={leftStripe} fill="none" stroke="#D4B896" strokeWidth="0.8" />
      <polyline points={rightStripe} fill="none" stroke="#D4B896" strokeWidth="0.8" />
    </g>
  );
}

// ===== WALL DECORATIONS =====

function WallDecorations({ leftEdge, rightEdge, wallH }: {
  leftEdge: Array<{x: number; y: number}>;
  rightEdge: Array<{x: number; y: number}>;
  wallH: number;
}) {
  // Clock on left wall (depth index 1 = DEPTH_MIN+1)
  const clockP = leftEdge[1];
  const cx = clockP.x + 4;
  const cy = clockP.y - wallH * 0.6;

  // Portrait on left wall (depth index 0)
  const portraitP = leftEdge[0];
  const fx = portraitP.x + 2;
  const fy = portraitP.y - wallH * 0.8;

  // Lanterns on right wall
  const lanternIndices = [0, 2];

  // Chalkboard on right wall (depth index 1)
  const menuP = rightEdge[1];
  const mx = menuP.x - 18;
  const my = menuP.y - wallH * 0.85;

  return (
    <g>
      {/* Wall clock */}
      <g>
        <circle cx={cx} cy={cy} r={5.5} fill="#FFF8F0" stroke="#8B6D4C" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={4.5} fill="white" />
        <line x1={cx} y1={cy} x2={cx} y2={cy - 3} stroke="#4a3728" strokeWidth="0.6" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="3600s" repeatCount="indefinite" />
        </line>
        <circle cx={cx} cy={cy} r={0.5} fill="#4a3728" />
      </g>

      {/* Framed bao portrait */}
      <g>
        <rect x={fx} y={fy} width={8} height={10} rx={0.8} fill="#8B6D4C" />
        <rect x={fx + 1} y={fy + 1} width={6} height={8} fill="#FFF3E8" rx={0.5} />
        <circle cx={fx + 4} cy={fy + 4.5} r={2.5} fill="#FFB5A7" opacity={0.6} />
        <circle cx={fx + 3.2} cy={fy + 3.8} r={0.5} fill="#4a3728" />
        <circle cx={fx + 4.8} cy={fy + 3.8} r={0.5} fill="#4a3728" />
        <path d={`M${fx + 3.2} ${fy + 5.8} Q${fx + 4} ${fy + 6.8} ${fx + 4.8} ${fy + 5.8}`} fill="none" stroke="#4a3728" strokeWidth="0.3" />
      </g>

      {/* Hanging lanterns on right wall */}
      {lanternIndices.map((idx, i) => {
        if (idx >= rightEdge.length) return null;
        const lp = rightEdge[idx];
        const lx = lp.x - 4;
        const ly = lp.y - wallH * 0.85;
        return (
          <g key={`lan-${i}`}>
            <line x1={lx} y1={ly} x2={lx} y2={ly + 6} stroke="#C4574A" strokeWidth="0.4" />
            <ellipse cx={lx} cy={ly + 10} rx={3.5} ry={5} fill="#E85D4A" opacity={0.9}>
              <animate
                attributeName="transform"
                type="rotate"
                values={`0 ${lx} ${ly + 5};${i % 2 ? 1.5 : -1.5} ${lx} ${ly + 5};0 ${lx} ${ly + 5}`}
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
              />
            </ellipse>
            <ellipse cx={lx} cy={ly + 10} rx={2.5} ry={3.5} fill="#FF7B6B" opacity={0.4} />
          </g>
        );
      })}

      {/* Chalkboard menu */}
      <g>
        <rect x={mx} y={my} width={16} height={12} rx={1} fill="#2D3B2D" />
        <rect x={mx + 1} y={my + 1} width={14} height={10} fill="#3D4B3D" rx={0.6} />
        <text x={mx + 8} y={my + 6.5} textAnchor="middle" fontSize="3.2" fill="#F0E8D8" fontFamily="serif">Menu</text>
        <text x={mx + 8} y={my + 9.5} textAnchor="middle" fontSize="2.2" fill="#F0E8D8" opacity="0.7">Dim Sum ★</text>
      </g>
    </g>
  );
}

// ===== ISO PRIMITIVES =====

function IsoBox({ col, row, h, top, front, side }: {
  col: number; row: number; h: number;
  top: string; front: string; side: string;
}) {
  const { x, y } = gridToScreen(col, row);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  return (
    <g>
      <polygon points={`${x},${y + hh} ${x - hw},${y} ${x - hw},${y - h} ${x},${y + hh - h}`} fill={side} />
      <polygon points={`${x},${y + hh} ${x + hw},${y} ${x + hw},${y - h} ${x},${y + hh - h}`} fill={front} />
      <polygon points={`${x},${y - hh - h} ${x + hw},${y - h} ${x},${y + hh - h} ${x - hw},${y - h}`} fill={top} />
    </g>
  );
}

function IsoStool({ col, row }: { col: number; row: number }) {
  const { x, y } = gridToScreen(col, row);
  return (
    <g>
      <rect x={x - 0.8} y={y - 4} width={1.6} height={6} fill="#8B6D4C" rx={0.3} />
      <ellipse cx={x} cy={y - 4} rx={5} ry={2.8} fill="#D4A574" />
      <ellipse cx={x} cy={y - 5.5} rx={4} ry={2.2} fill="#E8C9A8" />
    </g>
  );
}

function IsoRoundTable({ col1, row1, col2, row2 }: {
  col1: number; row1: number; col2: number; row2: number;
}) {
  const p1 = gridToScreen(col1, row1);
  const p2 = gridToScreen(col2, row2);
  const cx = (p1.x + p2.x) / 2;
  const cy = (p1.y + p2.y) / 2;
  const h = 8;

  return (
    <g>
      <rect x={cx - 1} y={cy - h + 2} width={2} height={h} fill="#8B6D4C" rx={0.3} />
      <ellipse cx={cx} cy={cy - h} rx={11} ry={6} fill="#A07855" />
      <ellipse cx={cx} cy={cy - h - 1} rx={10} ry={5.5} fill="#B8945E" />
      <IsoChair x={p1.x} y={p1.y} />
      <IsoChair x={p2.x} y={p2.y} />
    </g>
  );
}

function IsoChair({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 0.5} y={y - 3.5} width={1} height={4} fill="#8B6D4C" rx={0.2} />
      <ellipse cx={x} cy={y - 3.5} rx={4} ry={2.2} fill="#D4A574" />
    </g>
  );
}

function IsoBooth({ col1, row1, col2, row2 }: {
  col1: number; row1: number; col2: number; row2: number;
}) {
  const p1 = gridToScreen(col1, row1);
  const p2 = gridToScreen(col2, row2);
  const cx = (p1.x + p2.x) / 2;
  const cy = (p1.y + p2.y) / 2;

  return (
    <g>
      <ellipse cx={p1.x} cy={p1.y - 3} rx={8} ry={5} fill="#C4574A" />
      <ellipse cx={p1.x} cy={p1.y - 4.5} rx={7} ry={4} fill="#E8897C" />
      <ellipse cx={p2.x} cy={p2.y - 3} rx={8} ry={5} fill="#C4574A" />
      <ellipse cx={p2.x} cy={p2.y - 4.5} rx={7} ry={4} fill="#E8897C" />
      <rect x={cx - 4} y={cy - 10} width={8} height={5.5} rx={1} fill="#8B6D4C" />
      <rect x={cx - 5} y={cy - 11.5} width={10} height={2} rx={0.6} fill="#A07855" />
    </g>
  );
}

function IsoSteamer({ col, row, offsetX = 0 }: { col: number; row: number; offsetX?: number }) {
  const { x: bx, y: by } = gridToScreen(col, row);
  const x = bx + offsetX;
  const baseY = by - 14;

  return (
    <g>
      <ellipse cx={x} cy={baseY} rx={4} ry={2} fill="#C4A882" />
      <rect x={x - 4} y={baseY - 5.5} width={8} height={5.5} rx={1} fill="#D4B896" />
      <ellipse cx={x} cy={baseY - 5.5} rx={4} ry={2} fill="#E8D5BD" />
      <ellipse cx={x} cy={baseY - 7} rx={3.2} ry={1.6} fill="#C4A882" />
      <circle cx={x} cy={baseY - 7.8} r={0.8} fill="#8B6D4C" />
      {/* Steam */}
      <ellipse cx={x - 0.5} cy={baseY - 11} rx={1} ry={2} fill="white" opacity="0.3">
        <animate attributeName="cy" values={`${baseY - 11};${baseY - 18};${baseY - 25}`} dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.15;0" dur="2.8s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx={x + 0.5} cy={baseY - 10} rx={0.7} ry={1.5} fill="white" opacity="0.2">
        <animate attributeName="cy" values={`${baseY - 10};${baseY - 16};${baseY - 22}`} dur="3.2s" repeatCount="indefinite" begin="0.5s" />
        <animate attributeName="opacity" values="0.2;0.1;0" dur="3.2s" repeatCount="indefinite" begin="0.5s" />
      </ellipse>
    </g>
  );
}

function Condiment({ col, row }: { col: number; row: number }) {
  const { x, y } = gridToScreen(col, row);
  return (
    <g>
      <rect x={x - 1} y={y - 12} width={2} height={4} rx={0.5} fill="#E8D5BD" />
      <rect x={x - 0.7} y={y - 13.2} width={1.4} height={1.5} rx={0.3} fill="#C4A882" />
    </g>
  );
}

function Teapot({ col, row }: { col: number; row: number }) {
  const { x, y } = gridToScreen(col, row);
  return (
    <g>
      <ellipse cx={x} cy={y - 11} rx={3.5} ry={3} fill="#6B8F71" />
      <ellipse cx={x} cy={y - 12.5} rx={3} ry={1.5} fill="#7AA37F" />
      <circle cx={x} cy={y - 13.5} r={1.5} fill="#6B8F71" />
      <path d={`M${x + 3.5} ${y - 11.5} Q${x + 6} ${y - 13} ${x + 5} ${y - 15}`} fill="none" stroke="#6B8F71" strokeWidth="1" />
      <ellipse cx={x - 0.3} cy={y - 16} rx={1} ry={1.8} fill="white" opacity="0.25">
        <animate attributeName="cy" values={`${y - 16};${y - 22};${y - 28}`} dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.12;0" dur="3s" repeatCount="indefinite" />
      </ellipse>
    </g>
  );
}

function IsoMat({ col, row }: { col: number; row: number }) {
  const { x, y } = gridToScreen(col, row);
  const mw = TILE_W * 0.3;
  const mh = TILE_H * 0.3;
  return (
    <polygon
      points={`${x},${y - mh} ${x + mw},${y} ${x},${y + mh} ${x - mw},${y}`}
      fill="#8B6D4C"
      opacity={0.5}
    />
  );
}

function DoorFrame() {
  const doorPos = gridToScreen(5, 5);
  const dx = doorPos.x - TILE_W / 2 - 2;
  const dy = doorPos.y - 20;

  return (
    <g>
      <rect x={dx} y={dy} width={13} height={22} fill="#6B5440" rx={1} />
      <rect x={dx + 1.2} y={dy + 1.2} width={10.6} height={19.6} fill="#8B7B6B" rx={0.6} />
      {/* Noren curtain panels */}
      {[0, 1, 2].map((i) => {
        const px = dx + 2 + i * 3;
        return (
          <rect key={`n-${i}`} x={px} y={dy + 1.2} width={2.2} height={10} rx={0.5} fill="#C4574A" opacity={0.85}>
            <animate
              attributeName="transform"
              type="rotate"
              values={`0 ${px + 1.1} ${dy + 1.2};${i % 2 ? 1.5 : -1.5} ${px + 1.1} ${dy + 1.2};0 ${px + 1.1} ${dy + 1.2}`}
              dur="4s"
              repeatCount="indefinite"
              begin={`${i * 0.3}s`}
            />
          </rect>
        );
      })}
      <text x={dx + 6.5} y={dy + 9} textAnchor="middle" fontSize="3.5" fill="#FFF8F0" fontWeight="bold" opacity="0.7">包</text>
    </g>
  );
}

export default IsometricScene;
