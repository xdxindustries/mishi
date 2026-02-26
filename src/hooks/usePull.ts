import { useState, useCallback } from 'react';
import { Player, PullResult, Rarity, SINGLE_PULL_COST, MULTI_PULL_COST } from '../types';
import { doPull } from '../services/api';

export function usePull(
  player: Player | null,
  onPlayerUpdate: (p: Player) => void
) {
  const [pulling, setPulling] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);
  const [animationRarity, setAnimationRarity] = useState<Rarity>(Rarity.Common);
  const [pullResults, setPullResults] = useState<PullResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const performPull = useCallback(
    async (pullType: 'single' | 'multi') => {
      if (!player) return;
      const cost = pullType === 'single' ? SINGLE_PULL_COST : MULTI_PULL_COST;
      if (player.tokens < cost) return;
      if (pulling) return;

      setPulling(true);
      setShowResults(false);

      try {
        const response = await doPull(player.username, pullType);

        // Determine the highest rarity for the animation
        const rarityOrder = [Rarity.Common, Rarity.Uncommon, Rarity.Rare, Rarity.Epic, Rarity.Legendary];
        let highestRarity = Rarity.Common;
        for (const result of response.results) {
          if (rarityOrder.indexOf(result.rarity) > rarityOrder.indexOf(highestRarity)) {
            highestRarity = result.rarity;
          }
        }

        setAnimationRarity(highestRarity);
        setPullResults(response.results);

        // Start the animation
        setAnimationActive(true);

        // Update player state immediately (animation will play on top)
        onPlayerUpdate(response.updatedPlayer);
      } catch (e) {
        console.error('Pull failed:', e);
        setPulling(false);
      }
    },
    [player, pulling, onPlayerUpdate]
  );

  const onAnimationComplete = useCallback(() => {
    setAnimationActive(false);
    setShowResults(true);
    setPulling(false);
  }, []);

  const pullSingle = useCallback(() => performPull('single'), [performPull]);
  const pullMulti = useCallback(() => performPull('multi'), [performPull]);

  const dismissResults = useCallback(() => {
    setShowResults(false);
    setPullResults([]);
  }, []);

  return {
    pulling,
    pullResults,
    showResults,
    animationRarity,
    animationActive,
    pullSingle,
    pullMulti,
    dismissResults,
    onAnimationComplete,
  };
}
