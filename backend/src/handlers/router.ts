import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getPlayer } from './getPlayer.js';
import { createPlayer } from './createPlayer.js';
import { doPull } from './doPull.js';
import { upgradeRank } from './upgradeRank.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://demo.tuck.family',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
};

function response(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const { routeKey } = event;

  try {
    switch (routeKey) {
      case 'GET /player/{username}': {
        const username = event.pathParameters?.username;
        if (!username) {
          return response(400, { error: 'Missing username parameter' });
        }
        const result = await getPlayer(username);
        return response(result.statusCode, result.body);
      }

      case 'POST /player': {
        const body = JSON.parse(event.body ?? '{}');
        const result = await createPlayer(body);
        return response(result.statusCode, result.body);
      }

      case 'POST /pull': {
        const body = JSON.parse(event.body ?? '{}');
        const result = await doPull(body);
        return response(result.statusCode, result.body);
      }

      case 'POST /upgrade': {
        const body = JSON.parse(event.body ?? '{}');
        const result = await upgradeRank(body);
        return response(result.statusCode, result.body);
      }

      default:
        return response(404, { error: `Route not found: ${routeKey}` });
    }
  } catch (err) {
    console.error('Unhandled error:', err);
    return response(500, { error: 'Internal server error' });
  }
}
