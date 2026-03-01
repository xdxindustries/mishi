/**
 * Isometric coordinate system for the Bao Bistro.
 * The restaurant runs DIAGONALLY on the grid (increasing col+row = increasing depth).
 * Portrait-optimized: narrow tiles, tall viewBox.
 */

// Tile dimensions — narrower for portrait layout
export const TILE_W = 48;
export const TILE_H = 28;

// SVG viewBox — tight to content, scaled to fill viewport height
export const SCENE_W = 220;
export const SCENE_H = 180;

// Origin: top-center of the iso grid
export const ORIGIN_X = 110;
export const ORIGIN_Y = 20;

/** Min and max depth for the restaurant corridor. */
export const DEPTH_MIN = 1;
export const DEPTH_MAX = 10;
export const CORRIDOR_WIDTH = 2;

export interface GridPos {
  col: number;
  row: number;
}

export interface ScreenPos {
  x: number;
  y: number;
}

/** Convert grid (col, row) to screen (x, y) — center of the tile diamond. */
export function gridToScreen(col: number, row: number): ScreenPos {
  return {
    x: ORIGIN_X + (col - row) * (TILE_W / 2),
    y: ORIGIN_Y + (col + row) * (TILE_H / 2),
  };
}

/** Depth sort key: higher = rendered in front. */
export function isoDepth(col: number, row: number): number {
  return col + row;
}

/** SVG polygon points for a tile diamond. */
export function tileDiamond(col: number, row: number): string {
  const { x, y } = gridToScreen(col, row);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  return `${x},${y - hh} ${x + hw},${y} ${x},${y + hh} ${x - hw},${y}`;
}

/**
 * Generate floor tiles for the diagonal corridor.
 */
export function getFloorTiles(): GridPos[] {
  const tiles: GridPos[] = [];
  for (let depth = DEPTH_MIN; depth <= DEPTH_MAX; depth++) {
    for (let col = 0; col <= depth; col++) {
      const row = depth - col;
      if (col < 0 || row < 0) continue;
      if (Math.abs(col - row) > CORRIDOR_WIDTH) continue;
      tiles.push({ col, row });
    }
  }
  tiles.sort((a, b) => isoDepth(a.col, a.row) - isoDepth(b.col, b.row));
  return tiles;
}

/** Alternating warm wood tile colors. */
export function tileColor(col: number, row: number): string {
  return (col + row) % 2 === 0 ? '#D4A574' : '#C9A06A';
}
