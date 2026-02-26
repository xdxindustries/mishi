import { updateItem } from '../lib/dynamo.js';

interface UpgradeInput {
  username?: string;
  baoId?: string;
}

interface HandlerResult {
  statusCode: number;
  body: unknown;
}

const DUPES_TO_UPGRADE = 10;
const MAX_RANK = 9;

export async function upgradeRank(input: UpgradeInput): Promise<HandlerResult> {
  const { username, baoId } = input;

  if (!username || typeof username !== 'string') {
    return { statusCode: 400, body: { error: 'Username is required' } };
  }

  if (!baoId || typeof baoId !== 'string') {
    return { statusCode: 400, body: { error: 'baoId is required' } };
  }

  const pk = `PLAYER#${username}`;
  const sk = `BAO#${baoId}`;

  try {
    const updated = await updateItem(
      pk,
      sk,
      'SET #count = #count - :cost, #rank = #rank + :one',
      {
        ':cost': DUPES_TO_UPGRADE,
        ':one': 1,
        ':minCount': DUPES_TO_UPGRADE,
        ':maxRank': MAX_RANK,
      },
      {
        '#count': 'count',
        '#rank': 'rank',
      },
      '#count >= :minCount AND #rank < :maxRank',
    );

    if (!updated) {
      return {
        statusCode: 400,
        body: { error: 'Upgrade failed' },
      };
    }

    return {
      statusCode: 200,
      body: {
        baoId,
        newRank: updated.rank as number,
        remainingCount: updated.count as number,
      },
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 400,
        body: { error: 'Cannot upgrade: need at least 10 duplicates and rank must be below 9' },
      };
    }
    throw err;
  }
}
