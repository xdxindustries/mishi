import { getItem, transactWrite, TABLE_NAME } from '../lib/dynamo.js';
import { executePull, executeMultiPull, Rarity } from '../lib/gacha.js';
import type { GachaPullResult, PityState } from '../lib/gacha.js';

interface PullInput {
  username?: string;
  pullType?: 'single' | 'multi';
}

interface PullResultItem {
  baoId: string;
  rarity: string;
  isNew: boolean;
  isDuplicate: boolean;
  newCount: number;
  isPityTriggered: boolean;
}

interface HandlerResult {
  statusCode: number;
  body: unknown;
}

const SINGLE_PULL_COST = 100;
const MULTI_PULL_COST = 900;

export async function doPull(input: PullInput): Promise<HandlerResult> {
  const { username, pullType } = input;

  if (!username || typeof username !== 'string') {
    return { statusCode: 400, body: { error: 'Username is required' } };
  }

  if (pullType !== 'single' && pullType !== 'multi') {
    return { statusCode: 400, body: { error: 'pullType must be "single" or "multi"' } };
  }

  const cost = pullType === 'single' ? SINGLE_PULL_COST : MULTI_PULL_COST;

  // Fetch player profile
  const pk = `PLAYER#${username}`;
  const profile = await getItem(pk, 'PROFILE');

  if (!profile) {
    return { statusCode: 404, body: { error: 'Player not found' } };
  }

  const currentTokens = profile.tokens as number;
  if (currentTokens < cost) {
    return {
      statusCode: 400,
      body: { error: `Not enough tokens. Need ${cost}, have ${currentTokens}` },
    };
  }

  // Execute gacha rolls
  const pity: PityState = {
    pullsSinceEpic: profile.pullsSinceEpic as number,
    pullsSinceLegendary: profile.pullsSinceLegendary as number,
  };

  let gachaResults: GachaPullResult[];
  let newPity: PityState;

  if (pullType === 'single') {
    const { result, newPity: np } = executePull(pity);
    gachaResults = [result];
    newPity = np;
  } else {
    const { results, newPity: np } = executeMultiPull(pity);
    gachaResults = results;
    newPity = np;
  }

  // Fetch existing bao items to determine isNew/isDuplicate
  const baoUpdates = new Map<string, { totalAdded: number; rarity: string; isPityTriggered: boolean }>();

  for (const result of gachaResults) {
    const existing = baoUpdates.get(result.baoId);
    if (existing) {
      existing.totalAdded += 1;
      // Keep pity triggered if any pull for this bao triggered pity
      if (result.isPityTriggered) existing.isPityTriggered = true;
    } else {
      baoUpdates.set(result.baoId, {
        totalAdded: 1,
        rarity: result.rarity,
        isPityTriggered: result.isPityTriggered,
      });
    }
  }

  // Fetch all existing bao records in parallel
  const baoIds = Array.from(baoUpdates.keys());
  const existingBaos = new Map<string, Record<string, unknown>>();

  const baoFetches = baoIds.map(async (baoId) => {
    const bao = await getItem(pk, `BAO#${baoId}`);
    if (bao) {
      existingBaos.set(baoId, bao);
    }
  });
  await Promise.all(baoFetches);

  // Build transaction items
  const now = new Date().toISOString();
  const pullCount = gachaResults.length;
  const transactItems: Array<{
    Update?: Record<string, unknown>;
    Put?: Record<string, unknown>;
  }> = [];

  // Update profile
  transactItems.push({
    Update: {
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: 'PROFILE' },
      UpdateExpression:
        'SET tokens = tokens - :cost, totalPulls = totalPulls + :pulls, pullsSinceEpic = :pse, pullsSinceLegendary = :psl, lastPullAt = :now',
      ExpressionAttributeValues: {
        ':cost': cost,
        ':pulls': pullCount,
        ':pse': newPity.pullsSinceEpic,
        ':psl': newPity.pullsSinceLegendary,
        ':now': now,
      },
      ConditionExpression: 'tokens >= :cost',
    },
  });

  // Update or create bao items
  for (const [baoId, update] of baoUpdates) {
    const existing = existingBaos.get(baoId);
    if (existing) {
      transactItems.push({
        Update: {
          TableName: TABLE_NAME,
          Key: { PK: pk, SK: `BAO#${baoId}` },
          UpdateExpression: 'SET #count = #count + :added',
          ExpressionAttributeNames: { '#count': 'count' },
          ExpressionAttributeValues: { ':added': update.totalAdded },
        },
      });
    } else {
      transactItems.push({
        Put: {
          TableName: TABLE_NAME,
          Item: {
            PK: pk,
            SK: `BAO#${baoId}`,
            baoId,
            count: update.totalAdded,
            rank: 0,
            firstPulledAt: now,
          },
        },
      });
    }
  }

  // Execute transaction
  await transactWrite(transactItems);

  // Build response results (in original pull order)
  const pullCounts = new Map<string, number>();
  const results: PullResultItem[] = gachaResults.map((gr) => {
    const prevCount = pullCounts.get(gr.baoId) ?? 0;
    const existingCount = existingBaos.has(gr.baoId)
      ? (existingBaos.get(gr.baoId)!.count as number)
      : 0;
    const newCount = existingCount + prevCount + 1;
    pullCounts.set(gr.baoId, prevCount + 1);

    return {
      baoId: gr.baoId,
      rarity: gr.rarity,
      isNew: existingCount === 0 && prevCount === 0,
      isDuplicate: existingCount > 0 || prevCount > 0,
      newCount,
      isPityTriggered: gr.isPityTriggered,
    };
  });

  // Build updated player for response
  const updatedPlayer = {
    username: profile.username as string,
    tokens: currentTokens - cost,
    totalPulls: (profile.totalPulls as number) + pullCount,
    pity: newPity,
    collection: {} as Record<string, unknown>,
    createdAt: profile.createdAt as string,
    lastPullAt: now,
  };

  // Merge existing bao data + updates into collection
  for (const [baoId, existing] of existingBaos) {
    const added = baoUpdates.get(baoId)?.totalAdded ?? 0;
    updatedPlayer.collection[baoId] = {
      baoId,
      count: (existing.count as number) + added,
      rank: existing.rank as number,
      firstPulledAt: existing.firstPulledAt as string,
    };
  }
  // Add new baos
  for (const [baoId, update] of baoUpdates) {
    if (!existingBaos.has(baoId)) {
      updatedPlayer.collection[baoId] = {
        baoId,
        count: update.totalAdded,
        rank: 0,
        firstPulledAt: now,
      };
    }
  }

  return {
    statusCode: 200,
    body: { results, updatedPlayer },
  };
}
