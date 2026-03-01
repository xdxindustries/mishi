import { gridToScreen } from './isoUtils';

export interface ScenePosition {
  id: string;
  col: number;
  row: number;
  x: number;
  y: number;
  capacity: number;
  allowedActivities: Activity[];
}

export type Activity =
  | 'entering'
  | 'walking'
  | 'sitting'
  | 'eating'
  | 'chatting'
  | 'cooking'
  | 'sleeping'
  | 'leaving';

function pos(
  id: string,
  col: number,
  row: number,
  capacity: number,
  allowedActivities: Activity[]
): ScenePosition {
  const { x, y } = gridToScreen(col, row);
  return { id, col, row, x, y, capacity, allowedActivities };
}

/**
 * Extended diagonal restaurant layout. Depth 1-11.
 * |col-row| <= 2 corridor width.
 *
 * Depth 1-2: Kitchen
 * Depth 3-4: Counter bar + stools
 * Depth 5-6: Table A (two adjacent seats)
 * Depth 7-8: Table B (two adjacent seats)
 * Depth 8-9: Booth
 * Depth 10-11: Door
 */
export const SCENE_POSITIONS: ScenePosition[] = [
  // Door — bottom of the diagonal
  pos('door', 5, 5, 1, ['entering', 'leaving']),

  // Kitchen — top of the diagonal
  pos('kitchen', 1, 1, 2, ['cooking']),

  // Counter seats — depth 3-4
  pos('counter-1', 2, 1, 1, ['sitting', 'eating']),
  pos('counter-2', 1, 2, 1, ['sitting', 'eating']),
  pos('counter-3', 2, 2, 1, ['sitting', 'eating']),

  // Table A — depth 5-6, adjacent seats
  pos('table-a-1', 2, 3, 1, ['sitting', 'eating', 'chatting']),
  pos('table-a-2', 3, 2, 1, ['sitting', 'eating', 'chatting']),

  // Table B — depth 7-8, adjacent seats
  pos('table-b-1', 3, 4, 1, ['sitting', 'eating', 'chatting']),
  pos('table-b-2', 4, 3, 1, ['sitting', 'eating', 'chatting']),

  // Booth — depth 8-9
  pos('booth-1', 3, 5, 1, ['sitting', 'eating', 'sleeping', 'chatting']),
  pos('booth-2', 4, 4, 1, ['sitting', 'eating', 'sleeping', 'chatting']),
];

export const DOOR_POSITION = SCENE_POSITIONS.find((p) => p.id === 'door')!;

export const SEAT_POSITIONS = SCENE_POSITIONS.filter(
  (p) => p.id !== 'door' && p.id !== 'kitchen'
);

export const TABLE_PAIRS: [string, string][] = [
  ['table-a-1', 'table-a-2'],
  ['table-b-1', 'table-b-2'],
  ['booth-1', 'booth-2'],
];

export function getPosition(id: string): ScenePosition | undefined {
  return SCENE_POSITIONS.find((p) => p.id === id);
}
