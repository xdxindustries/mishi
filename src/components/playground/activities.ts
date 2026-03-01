import { Activity } from './positions';

export type BaoPersonality = 'social' | 'foodie' | 'chill' | 'energetic' | 'mysterious';

export const FACE_TO_PERSONALITY: Record<string, BaoPersonality> = {
  happy: 'social',
  sparkle: 'social',
  sleepy: 'chill',
  bliss: 'foodie',
  excited: 'energetic',
  fierce: 'energetic',
  smug: 'mysterious',
};

export interface ActivityConfig {
  minDuration: number; // seconds
  maxDuration: number;
  /** Idle animation to use during this activity */
  idleAnimation: 'breath' | 'hop' | 'wiggle' | 'cheer' | 'none';
}

export const ACTIVITY_CONFIG: Record<Activity, ActivityConfig> = {
  entering: { minDuration: 1.5, maxDuration: 2.5, idleAnimation: 'hop' },
  walking: { minDuration: 3, maxDuration: 5, idleAnimation: 'hop' },
  sitting: { minDuration: 5, maxDuration: 12, idleAnimation: 'breath' },
  eating: { minDuration: 4, maxDuration: 8, idleAnimation: 'cheer' },
  chatting: { minDuration: 6, maxDuration: 10, idleAnimation: 'hop' },
  cooking: { minDuration: 5, maxDuration: 8, idleAnimation: 'wiggle' },
  sleeping: { minDuration: 8, maxDuration: 12, idleAnimation: 'breath' },
  leaving: { minDuration: 1.5, maxDuration: 2.5, idleAnimation: 'hop' },
};

/** Weighted activity selection per personality. Higher = more likely. */
const ACTIVITY_WEIGHTS: Record<BaoPersonality, Partial<Record<Activity, number>>> = {
  social: { sitting: 1, eating: 1, chatting: 3, cooking: 1, sleeping: 0.5 },
  foodie: { sitting: 1, eating: 3, chatting: 1, cooking: 2, sleeping: 1 },
  chill: { sitting: 2, eating: 1, chatting: 0.5, cooking: 0.5, sleeping: 4 },
  energetic: { sitting: 0.5, eating: 1, chatting: 1, cooking: 3, sleeping: 0.3 },
  mysterious: { sitting: 3, eating: 1, chatting: 0.5, cooking: 1, sleeping: 1 },
};

export function getActivityDuration(activity: Activity): number {
  const config = ACTIVITY_CONFIG[activity];
  return config.minDuration + Math.random() * (config.maxDuration - config.minDuration);
}

export function selectNextActivity(
  personality: BaoPersonality,
  availableActivities: Activity[]
): Activity {
  const weights = ACTIVITY_WEIGHTS[personality];
  const weighted = availableActivities
    .filter((a) => a !== 'entering' && a !== 'leaving' && a !== 'walking')
    .map((a) => ({ activity: a, weight: weights[a] ?? 1 }));

  if (weighted.length === 0) return 'sitting';

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.activity;
  }
  return weighted[weighted.length - 1].activity;
}
