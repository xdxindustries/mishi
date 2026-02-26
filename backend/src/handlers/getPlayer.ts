import { queryByPk } from '../lib/dynamo.js';

interface HandlerResult {
  statusCode: number;
  body: unknown;
}

export async function getPlayer(username: string): Promise<HandlerResult> {
  const pk = `PLAYER#${username}`;
  const items = await queryByPk(pk);

  if (items.length === 0) {
    return {
      statusCode: 404,
      body: { error: 'Player not found' },
    };
  }

  // Find the PROFILE item
  const profileItem = items.find((item) => item.SK === 'PROFILE');
  if (!profileItem) {
    return {
      statusCode: 404,
      body: { error: 'Player profile not found' },
    };
  }

  // Find all BAO# items
  const baoItems = items.filter(
    (item) => typeof item.SK === 'string' && (item.SK as string).startsWith('BAO#'),
  );

  // Assemble collection
  const collection: Record<string, {
    baoId: string;
    count: number;
    rank: number;
    firstPulledAt: string;
  }> = {};

  for (const bao of baoItems) {
    const baoId = (bao.SK as string).replace('BAO#', '');
    collection[baoId] = {
      baoId,
      count: bao.count as number,
      rank: bao.rank as number,
      firstPulledAt: bao.firstPulledAt as string,
    };
  }

  const player = {
    username: profileItem.username as string,
    tokens: profileItem.tokens as number,
    totalPulls: profileItem.totalPulls as number,
    pity: {
      pullsSinceEpic: profileItem.pullsSinceEpic as number,
      pullsSinceLegendary: profileItem.pullsSinceLegendary as number,
    },
    collection,
    createdAt: profileItem.createdAt as string,
    lastPullAt: (profileItem.lastPullAt as string) ?? '',
  };

  return {
    statusCode: 200,
    body: player,
  };
}
