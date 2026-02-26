import {
  BaoId,
  Rarity,
  PityState,
  EPIC_PITY_HARD,
  EPIC_PITY_SOFT_START,
  LEGENDARY_PITY_HARD,
  LEGENDARY_PITY_SOFT_START,
} from '../types';
import { getBaosByRarity } from '../config/baoData';

// ---- Base pull rates ----
const BASE_RATES: Record<Rarity, number> = {
  [Rarity.Common]: 0.5,
  [Rarity.Uncommon]: 0.25,
  [Rarity.Rare]: 0.15,
  [Rarity.Epic]: 0.08,
  [Rarity.Legendary]: 0.02,
};

/**
 * Roll a rarity based on base rates + pity adjustments.
 * - Legendary hard pity at 90 pulls, soft pity from 75 (+1%/pull).
 * - Epic hard pity at 40 pulls, soft pity from 30 (+2%/pull).
 */
export function rollRarity(pity: PityState): { rarity: Rarity; isPityTriggered: boolean } {
  const { pullsSinceEpic, pullsSinceLegendary } = pity;

  // Hard pity: guaranteed legendary at 90
  if (pullsSinceLegendary + 1 >= LEGENDARY_PITY_HARD) {
    return { rarity: Rarity.Legendary, isPityTriggered: true };
  }

  // Hard pity: guaranteed epic at 40
  if (pullsSinceEpic + 1 >= EPIC_PITY_HARD) {
    return { rarity: Rarity.Epic, isPityTriggered: true };
  }

  // Calculate boosted rates
  let legendaryRate = BASE_RATES[Rarity.Legendary];
  let epicRate = BASE_RATES[Rarity.Epic];
  let isPityTriggered = false;

  // Legendary soft pity: +1% per pull past soft start
  if (pullsSinceLegendary >= LEGENDARY_PITY_SOFT_START) {
    const bonusPulls = pullsSinceLegendary - LEGENDARY_PITY_SOFT_START + 1;
    legendaryRate += bonusPulls * 0.01;
    isPityTriggered = true;
  }

  // Epic soft pity: +2% per pull past soft start
  if (pullsSinceEpic >= EPIC_PITY_SOFT_START) {
    const bonusPulls = pullsSinceEpic - EPIC_PITY_SOFT_START + 1;
    epicRate += bonusPulls * 0.02;
    isPityTriggered = true;
  }

  // Normalize rates so they sum to 1
  const rareRate = BASE_RATES[Rarity.Rare];
  const uncommonRate = BASE_RATES[Rarity.Uncommon];

  // Build cumulative thresholds (legendary first, then epic, rare, uncommon, common)
  const roll = Math.random();
  let cumulative = 0;

  cumulative += legendaryRate;
  if (roll < cumulative) {
    return { rarity: Rarity.Legendary, isPityTriggered };
  }

  cumulative += epicRate;
  if (roll < cumulative) {
    return { rarity: Rarity.Epic, isPityTriggered };
  }

  cumulative += rareRate;
  if (roll < cumulative) {
    return { rarity: Rarity.Rare, isPityTriggered: false };
  }

  cumulative += uncommonRate;
  if (roll < cumulative) {
    return { rarity: Rarity.Uncommon, isPityTriggered: false };
  }

  return { rarity: Rarity.Common, isPityTriggered: false };
}

/**
 * Pick a random bao of the given rarity.
 */
export function pickBaoForRarity(rarity: Rarity): BaoId {
  const pool = getBaosByRarity(rarity);
  if (pool.length === 0) {
    throw new Error(`No bao found for rarity: ${rarity}`);
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index].id;
}

/**
 * Update pity counters based on the rarity that was rolled.
 */
function updatePity(pity: PityState, rarity: Rarity): PityState {
  return {
    pullsSinceEpic: rarity === Rarity.Epic || rarity === Rarity.Legendary ? 0 : pity.pullsSinceEpic + 1,
    pullsSinceLegendary: rarity === Rarity.Legendary ? 0 : pity.pullsSinceLegendary + 1,
  };
}

/**
 * Execute a single gacha pull.
 */
export function executePull(pity: PityState): {
  baoId: BaoId;
  rarity: Rarity;
  isPityTriggered: boolean;
  newPity: PityState;
} {
  const { rarity, isPityTriggered } = rollRarity(pity);
  const baoId = pickBaoForRarity(rarity);
  const newPity = updatePity(pity, rarity);

  return { baoId, rarity, isPityTriggered, newPity };
}

/**
 * Execute a multi-pull (10 pulls).
 * Guarantee: if the first 9 pulls contain no Rare or above,
 * the 10th pull is forced to Rare+.
 */
export function executeMultiPull(pity: PityState): {
  results: Array<{ baoId: BaoId; rarity: Rarity; isPityTriggered: boolean }>;
  newPity: PityState;
} {
  const results: Array<{ baoId: BaoId; rarity: Rarity; isPityTriggered: boolean }> = [];
  let currentPity = pity;
  let hasRareOrAbove = false;

  for (let i = 0; i < 10; i++) {
    const isLastPull = i === 9;

    if (isLastPull && !hasRareOrAbove) {
      // Force Rare+ on the 10th pull — re-roll until we get Rare or better
      let pull = executePull(currentPity);
      const rareAndAbove = [Rarity.Rare, Rarity.Epic, Rarity.Legendary];

      if (!rareAndAbove.includes(pull.rarity)) {
        // Force a Rare+ rarity, pick randomly weighted among Rare/Epic/Legendary
        const forcedRarities = [Rarity.Rare, Rarity.Epic, Rarity.Legendary];
        const forceWeights = [0.75, 0.20, 0.05];
        const forceRoll = Math.random();
        let forcedRarity: Rarity;

        if (forceRoll < forceWeights[0]) {
          forcedRarity = forcedRarities[0];
        } else if (forceRoll < forceWeights[0] + forceWeights[1]) {
          forcedRarity = forcedRarities[1];
        } else {
          forcedRarity = forcedRarities[2];
        }

        const baoId = pickBaoForRarity(forcedRarity);
        const newPity = updatePity(currentPity, forcedRarity);

        results.push({ baoId, rarity: forcedRarity, isPityTriggered: true });
        currentPity = newPity;
      } else {
        results.push({ baoId: pull.baoId, rarity: pull.rarity, isPityTriggered: pull.isPityTriggered });
        currentPity = pull.newPity;
      }
    } else {
      const pull = executePull(currentPity);
      results.push({ baoId: pull.baoId, rarity: pull.rarity, isPityTriggered: pull.isPityTriggered });
      currentPity = pull.newPity;

      if ([Rarity.Rare, Rarity.Epic, Rarity.Legendary].includes(pull.rarity)) {
        hasRareOrAbove = true;
      }
    }
  }

  return { results, newPity: currentPity };
}
