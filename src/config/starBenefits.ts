import { BaoId } from '../types';

export interface StarBenefit {
  star: number;
  label: string;
  description: string;
}

export const STAR_BENEFITS: StarBenefit[] = [
  { star: 1, label: 'Idle Animation', description: 'Your bao comes alive with movement!' },
  { star: 2, label: 'Glow Aura', description: 'A beautiful aura surrounds your bao.' },
  { star: 3, label: 'Unique Title', description: 'Your bao earns a special title!' },
  { star: 4, label: 'Showcase Effects', description: 'Tap for dazzling particle effects!' },
  { star: 5, label: 'Golden Crown', description: 'The ultimate collector achievement!' },
];

export function getNextBenefit(currentRank: number): StarBenefit | null {
  return STAR_BENEFITS[currentRank] ?? null;
}

export function getCurrentBenefits(rank: number): StarBenefit[] {
  return STAR_BENEFITS.filter((b) => b.star <= rank);
}

/** Per-bao unique titles unlocked at ★3 */
export const BAO_TITLES: Partial<Record<BaoId, string>> = {
  [BaoId.LongBao]: 'Dragon Emperor',
  [BaoId.FengHuangBao]: 'Phoenix Sovereign',
  [BaoId.LexiconBao]: 'Sichuan Warrior',
  [BaoId.MishiBao]: 'Heart Stealer',
  [BaoId.HeijinBao]: 'Shadow Master',
  [BaoId.CaiHongBao]: 'Rainbow Spirit',
  [BaoId.BingHuoBao]: 'Elemental Fury',
  [BaoId.TangBao]: 'Sweet Sage',
  [BaoId.XiaJiaoBao]: 'Dumpling Knight',
  [BaoId.ZongziBao]: 'Bamboo Guardian',
  [BaoId.MochaBao]: 'Velvet Dream',
  [BaoId.XiaoLongBao]: 'Soup Whisperer',
  [BaoId.LiuShaBao]: 'Golden Flow',
  [BaoId.ShengJianBao]: 'Crispy Hero',
  [BaoId.ChaYeDanBao]: 'Tea Sage',
  [BaoId.TaroBao]: 'Purple Cloud',
  [BaoId.ChasiuBao]: 'Classic Champion',
  [BaoId.Mantou]: 'Sleepy Cloud',
  [BaoId.NaiWongBao]: 'Custard King',
  [BaoId.DouShaBao]: 'Bean Dreamer',
  [BaoId.CaiBao]: 'Garden Joy',
  [BaoId.ZhimaBao]: 'Sesame Star',
  [BaoId.YincaiBao]: 'Silver Sprout',
};
