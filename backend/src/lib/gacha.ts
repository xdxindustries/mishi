// Server-side authoritative gacha logic

export enum Rarity {
  Common = 'COMMON',
  Uncommon = 'UNCOMMON',
  Rare = 'RARE',
  Epic = 'EPIC',
  Legendary = 'LEGENDARY',
}

export interface PityState {
  pullsSinceEpic: number;
  pullsSinceLegendary: number;
}

export interface GachaPullResult {
  baoId: string;
  rarity: Rarity;
  isPityTriggered: boolean;
}

// Bao IDs per rarity
const BAO_POOL: Record<Rarity, string[]> = {
  [Rarity.Common]: ['CHASIU', 'MANTOU', 'NAIWONG', 'DOUSHA', 'CAI', 'ZHIMA', 'YINCAI'],
  [Rarity.Uncommon]: ['XIAOLONG', 'LIUSHA', 'SHENGJIAN', 'CHAYEDAN', 'TARO'],
  [Rarity.Rare]: ['TANG', 'XIAJIAO', 'ZONGZI', 'MOCHA'],
  [Rarity.Epic]: ['HEIJIN', 'CAIHONG', 'BINGHUO'],
  [Rarity.Legendary]: ['LONG', 'FENGHUANG'],
};

// Base rates
const BASE_RATES: Record<Rarity, number> = {
  [Rarity.Common]: 0.50,
  [Rarity.Uncommon]: 0.25,
  [Rarity.Rare]: 0.15,
  [Rarity.Epic]: 0.08,
  [Rarity.Legendary]: 0.02,
};

// Pity constants
const EPIC_PITY_SOFT_START = 30;
const EPIC_PITY_HARD = 40;
const EPIC_PITY_BOOST_PER_PULL = 0.02;

const LEGENDARY_PITY_SOFT_START = 75;
const LEGENDARY_PITY_HARD = 90;
const LEGENDARY_PITY_BOOST_PER_PULL = 0.01;

/**
 * Roll a rarity based on current pity state.
 * Returns the rarity and whether pity was triggered.
 */
export function rollRarity(pity: PityState): { rarity: Rarity; isPityTriggered: boolean } {
  const { pullsSinceEpic, pullsSinceLegendary } = pity;

  // Hard pity checks
  if (pullsSinceLegendary + 1 >= LEGENDARY_PITY_HARD) {
    return { rarity: Rarity.Legendary, isPityTriggered: true };
  }
  if (pullsSinceEpic + 1 >= EPIC_PITY_HARD) {
    return { rarity: Rarity.Epic, isPityTriggered: true };
  }

  // Calculate boosted rates
  let epicRate = BASE_RATES[Rarity.Epic];
  let legendaryRate = BASE_RATES[Rarity.Legendary];
  let isPityTriggered = false;

  // Soft pity for legendary
  if (pullsSinceLegendary + 1 > LEGENDARY_PITY_SOFT_START) {
    const pullsIntoSoft = pullsSinceLegendary + 1 - LEGENDARY_PITY_SOFT_START;
    legendaryRate += pullsIntoSoft * LEGENDARY_PITY_BOOST_PER_PULL;
    isPityTriggered = true;
  }

  // Soft pity for epic
  if (pullsSinceEpic + 1 > EPIC_PITY_SOFT_START) {
    const pullsIntoSoft = pullsSinceEpic + 1 - EPIC_PITY_SOFT_START;
    epicRate += pullsIntoSoft * EPIC_PITY_BOOST_PER_PULL;
    isPityTriggered = true;
  }

  // Build cumulative distribution
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

  cumulative += BASE_RATES[Rarity.Rare];
  if (roll < cumulative) {
    return { rarity: Rarity.Rare, isPityTriggered: false };
  }

  cumulative += BASE_RATES[Rarity.Uncommon];
  if (roll < cumulative) {
    return { rarity: Rarity.Uncommon, isPityTriggered: false };
  }

  return { rarity: Rarity.Common, isPityTriggered: false };
}

/**
 * Pick a random bao ID for a given rarity.
 */
export function pickBaoForRarity(rarity: Rarity): string {
  const pool = BAO_POOL[rarity];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

/**
 * Execute a single pull. Returns the result and updated pity.
 */
export function executePull(pity: PityState): { result: GachaPullResult; newPity: PityState } {
  const { rarity, isPityTriggered } = rollRarity(pity);
  const baoId = pickBaoForRarity(rarity);

  const newPity: PityState = {
    pullsSinceEpic: rarity === Rarity.Epic || rarity === Rarity.Legendary ? 0 : pity.pullsSinceEpic + 1,
    pullsSinceLegendary: rarity === Rarity.Legendary ? 0 : pity.pullsSinceLegendary + 1,
  };

  return {
    result: { baoId, rarity, isPityTriggered },
    newPity,
  };
}

/**
 * Execute a multi-pull (10 pulls). Guarantees Rare+ on the 10th pull if none appeared in the first 9.
 */
export function executeMultiPull(pity: PityState): { results: GachaPullResult[]; newPity: PityState } {
  const results: GachaPullResult[] = [];
  let currentPity = { ...pity };
  let gotRareOrBetter = false;

  for (let i = 0; i < 10; i++) {
    const isLastPull = i === 9;

    if (isLastPull && !gotRareOrBetter) {
      // Guarantee Rare+ on 10th pull
      // Roll but force at least Rare
      let { result, newPity } = executePull(currentPity);

      if (
        result.rarity === Rarity.Common ||
        result.rarity === Rarity.Uncommon
      ) {
        // Re-roll as Rare, Epic, or Legendary with adjusted weights
        const guaranteedRarities = [Rarity.Rare, Rarity.Epic, Rarity.Legendary];
        const weights = [
          BASE_RATES[Rarity.Rare],
          BASE_RATES[Rarity.Epic],
          BASE_RATES[Rarity.Legendary],
        ];
        const totalWeight = weights.reduce((a, b) => a + b, 0);

        const roll = Math.random() * totalWeight;
        let cumulative = 0;
        let guaranteedRarity = Rarity.Rare;

        for (let j = 0; j < guaranteedRarities.length; j++) {
          cumulative += weights[j];
          if (roll < cumulative) {
            guaranteedRarity = guaranteedRarities[j];
            break;
          }
        }

        const baoId = pickBaoForRarity(guaranteedRarity);
        result = { baoId, rarity: guaranteedRarity, isPityTriggered: true };

        // Update pity for guaranteed rarity
        newPity = {
          pullsSinceEpic:
            guaranteedRarity === Rarity.Epic || guaranteedRarity === Rarity.Legendary
              ? 0
              : currentPity.pullsSinceEpic + 1,
          pullsSinceLegendary:
            guaranteedRarity === Rarity.Legendary ? 0 : currentPity.pullsSinceLegendary + 1,
        };
      }

      results.push(result);
      currentPity = newPity;
    } else {
      const { result, newPity } = executePull(currentPity);
      results.push(result);
      currentPity = newPity;

      if (
        result.rarity === Rarity.Rare ||
        result.rarity === Rarity.Epic ||
        result.rarity === Rarity.Legendary
      ) {
        gotRareOrBetter = true;
      }
    }
  }

  return { results, newPity: currentPity };
}
