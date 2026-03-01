import { useState, useEffect, useCallback, useRef } from 'react';
import { BaoId, OwnedBao, BaoDefinition } from '../../types';
import { getBaoById } from '../../config/baoData';
import { Activity, SEAT_POSITIONS, DOOR_POSITION, TABLE_PAIRS, getPosition } from './positions';
import { gridToScreen } from './isoUtils';
import {
  BaoPersonality,
  FACE_TO_PERSONALITY,
  ACTIVITY_CONFIG,
  getActivityDuration,
  selectNextActivity,
} from './activities';

export interface PlaygroundBaoState {
  instanceId: string;
  baoId: BaoId;
  bao: BaoDefinition;
  owned: OwnedBao;
  personality: BaoPersonality;
  activity: Activity;
  positionId: string;
  /** Assigned seat this bao is heading to / sitting at */
  assignedSeatId: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facingRight: boolean;
  enteredAt: number;
  activityStartedAt: number;
  activityDuration: number;
  visitDuration: number; // total time this bao will stay
}

const MAX_BAOS = 7;
const MIN_ARRIVAL_INTERVAL = 6; // seconds
const MAX_ARRIVAL_INTERVAL = 12;
const MIN_VISIT_DURATION = 20;
const MAX_VISIT_DURATION = 40;

let instanceCounter = 0;

function createInstanceId(): string {
  return `pb-${++instanceCounter}-${Date.now().toString(36)}`;
}

function pickRandomBao(ownedBaos: OwnedBao[], activeBaoIds: Set<string>): OwnedBao | null {
  // Weight by rank (higher rank = more frequent)
  const available = ownedBaos.filter((o) => !activeBaoIds.has(o.baoId));
  if (available.length === 0) {
    // Allow duplicates if all baos are in scene
    if (ownedBaos.length === 0) return null;
    return ownedBaos[Math.floor(Math.random() * ownedBaos.length)];
  }

  const weighted = available.map((o) => ({
    owned: o,
    weight: 1 + o.rank * 0.5,
  }));
  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.owned;
  }
  return weighted[weighted.length - 1].owned;
}

function findAvailableSeat(occupiedPositions: Map<string, string[]>): string | null {
  const seats = [...SEAT_POSITIONS].sort(() => Math.random() - 0.5);
  for (const seat of seats) {
    const occupants = occupiedPositions.get(seat.id) ?? [];
    if (occupants.length < seat.capacity) {
      return seat.id;
    }
  }
  return null;
}

export function usePlaygroundSimulation(ownedBaos: OwnedBao[]) {
  const [activeBaos, setActiveBaos] = useState<PlaygroundBaoState[]>([]);
  const nextArrivalRef = useRef(Date.now() + 2000); // first arrival in 2s
  const tickRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const getOccupiedPositions = useCallback((baos: PlaygroundBaoState[]) => {
    const map = new Map<string, string[]>();
    for (const b of baos) {
      if (b.activity !== 'entering' && b.activity !== 'leaving' && b.activity !== 'walking') {
        const arr = map.get(b.positionId) ?? [];
        arr.push(b.instanceId);
        map.set(b.positionId, arr);
      }
    }
    return map;
  }, []);

  const spawnBao = useCallback((baos: PlaygroundBaoState[]): PlaygroundBaoState | null => {
    if (baos.length >= MAX_BAOS || ownedBaos.length === 0) return null;

    const activeBaoIds = new Set(baos.map((b) => b.baoId));
    const chosen = pickRandomBao(ownedBaos, activeBaoIds);
    if (!chosen) return null;

    let bao: BaoDefinition;
    try {
      bao = getBaoById(chosen.baoId);
    } catch {
      return null;
    }

    const occupied = getOccupiedPositions(baos);
    const seatId = findAvailableSeat(occupied);
    if (!seatId) return null;

    const now = Date.now() / 1000;
    // During entering, bao hops one tile inward from door along the diagonal
    const enterTarget = gridToScreen(4, 4);
    const enterTargetX = enterTarget.x;
    const enterTargetY = enterTarget.y;

    return {
      instanceId: createInstanceId(),
      baoId: chosen.baoId as BaoId,
      bao,
      owned: chosen,
      personality: FACE_TO_PERSONALITY[bao.faceExpression] ?? 'social',
      activity: 'entering',
      positionId: 'door',
      assignedSeatId: seatId,
      x: DOOR_POSITION.x,
      y: DOOR_POSITION.y,
      targetX: enterTargetX,
      targetY: enterTargetY,
      facingRight: true,
      enteredAt: now,
      activityStartedAt: now,
      activityDuration: getActivityDuration('entering'),
      visitDuration: MIN_VISIT_DURATION + Math.random() * (MAX_VISIT_DURATION - MIN_VISIT_DURATION),
    };
  }, [ownedBaos, getOccupiedPositions]);

  // Main simulation tick
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const now = Date.now() / 1000;

      setActiveBaos((prev) => {
        let updated = [...prev];
        let changed = false;

        // Process each bao
        for (let i = updated.length - 1; i >= 0; i--) {
          const bao = updated[i];
          const elapsed = now - bao.activityStartedAt;

          if (elapsed < bao.activityDuration) continue;

          // Time to transition
          changed = true;
          const timeInScene = now - bao.enteredAt;

          if (bao.activity === 'leaving') {
            // Remove from scene
            updated.splice(i, 1);
            continue;
          }

          // Check if visit is over
          if (timeInScene >= bao.visitDuration && bao.activity !== 'entering' && bao.activity !== 'walking') {
            updated[i] = {
              ...bao,
              activity: 'leaving',
              targetX: DOOR_POSITION.x,
              targetY: DOOR_POSITION.y,
              facingRight: false,
              activityStartedAt: now,
              activityDuration: getActivityDuration('leaving'),
            };
            continue;
          }

          if (bao.activity === 'entering') {
            // Transition to walking to assigned seat
            const seat = getPosition(bao.assignedSeatId);
            if (seat) {
              updated[i] = {
                ...bao,
                activity: 'walking',
                positionId: bao.assignedSeatId,
                x: bao.targetX, // snap to where entering ended
                y: bao.targetY,
                targetX: seat.x,
                targetY: seat.y,
                facingRight: seat.x > bao.targetX,
                activityStartedAt: now,
                activityDuration: getActivityDuration('walking'),
              };
            }
            continue;
          }

          if (bao.activity === 'walking') {
            // Arrived at seat, snap position
            updated[i] = {
              ...bao,
              activity: 'sitting',
              x: bao.targetX,
              y: bao.targetY,
              activityStartedAt: now,
              activityDuration: getActivityDuration('sitting'),
            };
            continue;
          }

          // Seated bao — pick next activity
          const pos = getPosition(bao.positionId);
          const availableActivities = pos?.allowedActivities.filter(
            (a) => a !== 'entering' && a !== 'leaving'
          ) ?? ['sitting'];

          // Check for chatting: need a partner at the same table
          const canChat = TABLE_PAIRS.some(([a, b]) => {
            const partnerId = bao.positionId === a ? b : bao.positionId === b ? a : null;
            if (!partnerId) return false;
            return updated.some(
              (other) =>
                other.instanceId !== bao.instanceId &&
                other.positionId === partnerId &&
                other.activity !== 'entering' &&
                other.activity !== 'leaving' &&
                other.activity !== 'walking'
            );
          });

          const filteredActivities = canChat
            ? availableActivities
            : availableActivities.filter((a) => a !== 'chatting');

          const nextActivity = selectNextActivity(bao.personality, filteredActivities);
          const config = ACTIVITY_CONFIG[nextActivity];

          updated[i] = {
            ...bao,
            activity: nextActivity,
            activityStartedAt: now,
            activityDuration: getActivityDuration(nextActivity),
          };
        }

        // Spawn new bao
        if (now * 1000 >= nextArrivalRef.current && updated.length < MAX_BAOS) {
          const newBao = spawnBao(updated);
          if (newBao) {
            updated = [...updated, newBao];
            changed = true;
          }
          nextArrivalRef.current =
            Date.now() +
            (MIN_ARRIVAL_INTERVAL + Math.random() * (MAX_ARRIVAL_INTERVAL - MIN_ARRIVAL_INTERVAL)) * 1000;
        }

        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [spawnBao, getOccupiedPositions]);

  const handleBaoTap = useCallback((instanceId: string) => {
    // Could add tap reaction here in the future
  }, []);

  const speedUpArrival = useCallback(() => {
    nextArrivalRef.current = Date.now() + 1000;
  }, []);

  return { activeBaos, handleBaoTap, speedUpArrival };
}
