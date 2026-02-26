import { putItem } from '../lib/dynamo.js';

interface CreatePlayerInput {
  username?: string;
}

interface HandlerResult {
  statusCode: number;
  body: unknown;
}

const STARTING_TOKENS = 99999;

export async function createPlayer(input: CreatePlayerInput): Promise<HandlerResult> {
  const { username } = input;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return {
      statusCode: 400,
      body: { error: 'Username is required' },
    };
  }

  const sanitized = username.trim().toLowerCase();

  // Validate username format
  if (!/^[a-z0-9_-]{3,20}$/.test(sanitized)) {
    return {
      statusCode: 400,
      body: { error: 'Username must be 3-20 characters, alphanumeric, hyphens, or underscores' },
    };
  }

  const now = new Date().toISOString();

  const item = {
    PK: `PLAYER#${sanitized}`,
    SK: 'PROFILE',
    username: sanitized,
    tokens: STARTING_TOKENS,
    totalPulls: 0,
    pullsSinceEpic: 0,
    pullsSinceLegendary: 0,
    createdAt: now,
    lastPullAt: '',
  };

  try {
    await putItem(item, 'attribute_not_exists(PK)');
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        body: { error: 'Player already exists' },
      };
    }
    throw err;
  }

  return {
    statusCode: 201,
    body: {
      username: sanitized,
      tokens: STARTING_TOKENS,
      totalPulls: 0,
      pity: {
        pullsSinceEpic: 0,
        pullsSinceLegendary: 0,
      },
      collection: {},
      createdAt: now,
      lastPullAt: '',
    },
  };
}
