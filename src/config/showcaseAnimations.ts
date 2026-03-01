import { BaoId, Rarity } from '../types';

export type ShowcaseAnimationId =
  // Shared tier animations
  | 'squish'
  | 'spin'
  | 'peek'
  | 'powerUp'
  | 'flex'
  // Epic unique
  | 'shadowCloak'
  | 'rainbowShift'
  | 'elementalFlip'
  // Legendary — Long Bao
  | 'dragonTransform'
  | 'fireBreath'
  | 'dragonRoar'
  // Legendary — Feng Huang
  | 'phoenixWings'
  | 'featherBurst'
  | 'phoenixFlame'
  // Legendary — Lexicon
  | 'warriorStance'
  | 'calligraphyFlourish'
  | 'pepperStorm'
  // Legendary — Mishi
  | 'megaPuppyEyes'
  | 'heartBurst'
  | 'mishiWink';

export interface ShowcaseAnimationDef {
  id: ShowcaseAnimationId;
  duration: number;
}

const COMMON_ANIMATIONS: ShowcaseAnimationDef[] = [
  { id: 'squish', duration: 350 },
];

const UNCOMMON_ANIMATIONS: ShowcaseAnimationDef[] = [
  { id: 'squish', duration: 350 },
  { id: 'spin', duration: 600 },
  { id: 'peek', duration: 800 },
];

const RARE_ANIMATIONS: ShowcaseAnimationDef[] = [
  { id: 'spin', duration: 600 },
  { id: 'powerUp', duration: 900 },
  { id: 'flex', duration: 700 },
];

const EPIC_ANIMATIONS: Record<string, ShowcaseAnimationDef[]> = {
  [BaoId.HeijinBao]: [
    { id: 'shadowCloak', duration: 1200 },
    { id: 'powerUp', duration: 900 },
  ],
  [BaoId.CaiHongBao]: [
    { id: 'rainbowShift', duration: 1400 },
    { id: 'spin', duration: 600 },
  ],
  [BaoId.BingHuoBao]: [
    { id: 'elementalFlip', duration: 1100 },
    { id: 'powerUp', duration: 900 },
  ],
};

const LEGENDARY_ANIMATIONS: Record<string, ShowcaseAnimationDef[]> = {
  [BaoId.LongBao]: [
    { id: 'dragonTransform', duration: 2000 },
    { id: 'fireBreath', duration: 1500 },
    { id: 'dragonRoar', duration: 1200 },
  ],
  [BaoId.FengHuangBao]: [
    { id: 'phoenixWings', duration: 1800 },
    { id: 'featherBurst', duration: 1400 },
    { id: 'phoenixFlame', duration: 1600 },
  ],
  [BaoId.LexiconBao]: [
    { id: 'warriorStance', duration: 1500 },
    { id: 'calligraphyFlourish', duration: 1800 },
    { id: 'pepperStorm', duration: 1300 },
  ],
  [BaoId.MishiBao]: [
    { id: 'megaPuppyEyes', duration: 2000 },
    { id: 'heartBurst', duration: 1500 },
    { id: 'mishiWink', duration: 1200 },
  ],
};

export function getShowcaseAnimations(baoId: string, rarity: Rarity): ShowcaseAnimationDef[] {
  if (rarity === Rarity.Legendary) return LEGENDARY_ANIMATIONS[baoId] ?? RARE_ANIMATIONS;
  if (rarity === Rarity.Epic) return EPIC_ANIMATIONS[baoId] ?? RARE_ANIMATIONS;
  if (rarity === Rarity.Rare) return RARE_ANIMATIONS;
  if (rarity === Rarity.Uncommon) return UNCOMMON_ANIMATIONS;
  return COMMON_ANIMATIONS;
}
