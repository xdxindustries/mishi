import { useMemo } from 'react';
import { Player, Rarity, BaoDefinition, OwnedBao } from '../types';
import { ALL_BAO, getBaoById } from '../config/baoData';
import { compareByRarity } from '../utils/rarity';

export interface OwnedBaoWithDef extends OwnedBao {
  definition: BaoDefinition;
}

export function useCollection(player: Player | null) {
  const ownedBao = useMemo<OwnedBaoWithDef[]>(() => {
    if (!player) return [];
    return Object.values(player.collection).map((owned) => ({
      ...owned,
      definition: getBaoById(owned.baoId),
    }));
  }, [player]);

  const unownedBao = useMemo<BaoDefinition[]>(() => {
    if (!player) return ALL_BAO;
    return ALL_BAO.filter((bao) => !player.collection[bao.id]);
  }, [player]);

  const totalOwned = ownedBao.length;
  const totalBao = ALL_BAO.length;
  const completionPercent = totalBao > 0 ? Math.round((totalOwned / totalBao) * 100) : 0;

  const filterByRarity = useMemo(() => {
    return (rarity: Rarity) => ownedBao.filter((b) => b.definition.rarity === rarity);
  }, [ownedBao]);

  const sortedCollection = useMemo(() => {
    return [...ownedBao].sort((a, b) =>
      compareByRarity(a.definition.rarity, b.definition.rarity)
    );
  }, [ownedBao]);

  return {
    ownedBao,
    unownedBao,
    totalOwned,
    totalBao,
    completionPercent,
    filterByRarity,
    sortedCollection,
  };
}
