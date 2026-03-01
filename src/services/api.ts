import {
  Player,
  PullResponse,
  PullResult,
  UpgradeResponse,
  BaoId,
  Rarity,
  SINGLE_PULL_COST,
  MULTI_PULL_COST,
  STARTING_TOKENS,
  MAX_RANK,
  getUpgradeCost,
} from '../types';
import { executePull, executeMultiPull } from '../utils/gacha';
import { getBaoById } from '../config/baoData';

// ---- Configuration ----
const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_LOCAL = !API_BASE;

const STORAGE_KEY = 'mishi_players';

// ---- Local storage helpers ----

function loadPlayers(): Record<string, Player> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePlayers(players: Record<string, Player>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

function savePlayer(player: Player): void {
  const players = loadPlayers();
  players[player.username] = player;
  savePlayers(players);
}

function createNewPlayer(username: string): Player {
  return {
    username,
    tokens: STARTING_TOKENS,
    totalPulls: 0,
    pity: {
      pullsSinceEpic: 0,
      pullsSinceLegendary: 0,
    },
    collection: {},
    createdAt: new Date().toISOString(),
    lastPullAt: '',
  };
}

// ---- API functions ----

function migratePlayer(player: Player): Player {
  // Migrate old rank system (max 9, flat 10 cost) to new (max 5, escalating costs)
  let needsSave = false;
  for (const key of Object.keys(player.collection)) {
    const owned = player.collection[key];
    if (owned.rank > MAX_RANK) {
      // Refund approximate dupes for ranks above 5 (old system was 10 per rank)
      const excessRanks = owned.rank - MAX_RANK;
      owned.count += excessRanks * 10;
      owned.rank = MAX_RANK;
      needsSave = true;
    }
  }
  if (needsSave) savePlayer(player);
  return player;
}

export async function getOrCreatePlayer(username: string): Promise<Player> {
  if (USE_LOCAL) {
    const players = loadPlayers();
    if (players[username]) {
      return migratePlayer(players[username]);
    }
    const newPlayer = createNewPlayer(username);
    savePlayer(newPlayer);
    return newPlayer;
  }

  const res = await fetch(`${API_BASE}/api/player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error(`Failed to get/create player: ${res.statusText}`);
  return res.json();
}

export async function doPull(
  username: string,
  pullType: 'single' | 'multi'
): Promise<PullResponse> {
  if (USE_LOCAL) {
    return doLocalPull(username, pullType);
  }

  const res = await fetch(`${API_BASE}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, pullType }),
  });
  if (!res.ok) throw new Error(`Pull failed: ${res.statusText}`);
  return res.json();
}

export async function doUpgrade(
  username: string,
  baoId: BaoId
): Promise<UpgradeResponse> {
  if (USE_LOCAL) {
    return doLocalUpgrade(username, baoId);
  }

  const res = await fetch(`${API_BASE}/api/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, baoId }),
  });
  if (!res.ok) throw new Error(`Upgrade failed: ${res.statusText}`);
  return res.json();
}

// ---- Local implementations ----

function doLocalPull(username: string, pullType: 'single' | 'multi'): PullResponse {
  const players = loadPlayers();
  const player = players[username];
  if (!player) throw new Error(`Player not found: ${username}`);

  const cost = pullType === 'single' ? SINGLE_PULL_COST : MULTI_PULL_COST;
  if (player.tokens < cost) {
    throw new Error('Not enough tokens');
  }

  player.tokens -= cost;

  let rawResults: Array<{ baoId: BaoId; rarity: Rarity; isPityTriggered: boolean }>;

  if (pullType === 'single') {
    const pull = executePull(player.pity);
    rawResults = [{ baoId: pull.baoId, rarity: pull.rarity, isPityTriggered: pull.isPityTriggered }];
    player.pity = pull.newPity;
    player.totalPulls += 1;
  } else {
    const multi = executeMultiPull(player.pity);
    rawResults = multi.results;
    player.pity = multi.newPity;
    player.totalPulls += 10;
  }

  const results: PullResult[] = rawResults.map((raw) => {
    const isNew = !player.collection[raw.baoId];
    const existing = player.collection[raw.baoId];
    const newCount = (existing?.count ?? 0) + 1;

    player.collection[raw.baoId] = {
      baoId: raw.baoId,
      count: newCount,
      rank: existing?.rank ?? 0,
      firstPulledAt: existing?.firstPulledAt ?? new Date().toISOString(),
    };

    return {
      baoId: raw.baoId,
      rarity: raw.rarity,
      isNew,
      isDuplicate: !isNew,
      newCount,
      isPityTriggered: raw.isPityTriggered,
    };
  });

  player.lastPullAt = new Date().toISOString();
  savePlayer(player);

  return {
    results,
    updatedPlayer: player,
  };
}

function doLocalUpgrade(username: string, baoId: BaoId): UpgradeResponse {
  const players = loadPlayers();
  const player = players[username];
  if (!player) throw new Error(`Player not found: ${username}`);

  const owned = player.collection[baoId];
  if (!owned) throw new Error(`Bao not owned: ${baoId}`);
  if (owned.rank >= MAX_RANK) throw new Error('Already at max rank');
  const cost = getUpgradeCost(owned.rank);
  if (cost < 0) throw new Error('Already at max rank');
  if (owned.count < cost) throw new Error('Not enough duplicates');

  owned.count -= cost;
  owned.rank += 1;

  // Verify the bao exists in our catalog (type safety)
  getBaoById(baoId);

  savePlayer(player);

  return {
    baoId,
    newRank: owned.rank,
    remainingCount: owned.count,
  };
}
