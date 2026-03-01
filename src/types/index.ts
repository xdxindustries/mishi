// ---- Enums ----

export enum Rarity {
  Common = 'COMMON',
  Uncommon = 'UNCOMMON',
  Rare = 'RARE',
  Epic = 'EPIC',
  Legendary = 'LEGENDARY',
}

export enum BaoId {
  ChasiuBao = 'CHASIU',
  Mantou = 'MANTOU',
  NaiWongBao = 'NAIWONG',
  DouShaBao = 'DOUSHA',
  CaiBao = 'CAI',
  ZhimaBao = 'ZHIMA',
  YincaiBao = 'YINCAI',
  XiaoLongBao = 'XIAOLONG',
  LiuShaBao = 'LIUSHA',
  ShengJianBao = 'SHENGJIAN',
  ChaYeDanBao = 'CHAYEDAN',
  TaroBao = 'TARO',
  TangBao = 'TANG',
  XiaJiaoBao = 'XIAJIAO',
  ZongziBao = 'ZONGZI',
  MochaBao = 'MOCHA',
  HeijinBao = 'HEIJIN',
  CaiHongBao = 'CAIHONG',
  BingHuoBao = 'BINGHUO',
  LongBao = 'LONG',
  FengHuangBao = 'FENGHUANG',
  MishiBao = 'MISHI',
  LexiconBao = 'LEXICON',
}

// ---- Bao Definition (static game data) ----

export interface BaoDefinition {
  id: BaoId;
  name: string;
  description: string;
  rarity: Rarity;
  baseColor: string;
  accentColor: string;
  pattern: 'solid' | 'swirl' | 'dots' | 'gradient' | 'marble' | 'stripes' | 'crystal' | 'flame';
  faceExpression: 'happy' | 'sleepy' | 'excited' | 'smug' | 'sparkle' | 'bliss' | 'fierce';
  /** Optional AI-generated art URL for card/collection view */
  artUrl?: string;
  /** Optional AI-generated art URL for pull reveal animation */
  revealArtUrl?: string;
}

// ---- Player-owned Bao instance ----

export interface OwnedBao {
  baoId: BaoId;
  count: number;
  rank: number; // 0 = base, max 9
  firstPulledAt: string;
}

// ---- Player ----

export interface Player {
  username: string;
  tokens: number;
  totalPulls: number;
  pity: PityState;
  collection: Record<string, OwnedBao>;
  createdAt: string;
  lastPullAt: string;
}

export interface PityState {
  pullsSinceEpic: number;
  pullsSinceLegendary: number;
}

// ---- API types ----

export interface PullRequest {
  username: string;
  pullType: 'single' | 'multi';
}

export interface PullResult {
  baoId: BaoId;
  rarity: Rarity;
  isNew: boolean;
  isDuplicate: boolean;
  newCount: number;
  isPityTriggered: boolean;
}

export interface PullResponse {
  results: PullResult[];
  updatedPlayer: Player;
}

export interface UpgradeRequest {
  username: string;
  baoId: BaoId;
}

export interface UpgradeResponse {
  baoId: BaoId;
  newRank: number;
  remainingCount: number;
}

// ---- Constants ----

export const SINGLE_PULL_COST = 100;
export const MULTI_PULL_COST = 900;
export const STAR_COSTS = [5, 10, 20, 50, 100] as const;
export const MAX_RANK = 5;

/** Returns the dupe cost to upgrade from currentRank to currentRank+1, or -1 if max. */
export function getUpgradeCost(currentRank: number): number {
  if (currentRank >= MAX_RANK) return -1;
  return STAR_COSTS[currentRank];
}
export const STARTING_TOKENS = 99999;

export const EPIC_PITY_HARD = 40;
export const EPIC_PITY_SOFT_START = 30;
export const LEGENDARY_PITY_HARD = 90;
export const LEGENDARY_PITY_SOFT_START = 75;
