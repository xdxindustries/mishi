import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import type {
  GetCommandInput,
  PutCommandInput,
  QueryCommandInput,
  UpdateCommandInput,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const TABLE_NAME = process.env.TABLE_NAME!;

export async function getItem(pk: string, sk: string): Promise<Record<string, unknown> | undefined> {
  const params: GetCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  };
  const result = await docClient.send(new GetCommand(params));
  return result.Item as Record<string, unknown> | undefined;
}

export async function putItem(
  item: Record<string, unknown>,
  conditionExpression?: string,
): Promise<void> {
  const params: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: item,
    ...(conditionExpression && { ConditionExpression: conditionExpression }),
  };
  await docClient.send(new PutCommand(params));
}

export async function queryByPk(pk: string): Promise<Record<string, unknown>[]> {
  const params: QueryCommandInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': pk },
  };
  const result = await docClient.send(new QueryCommand(params));
  return (result.Items ?? []) as Record<string, unknown>[];
}

export async function updateItem(
  pk: string,
  sk: string,
  updateExpression: string,
  expressionAttributeValues: Record<string, unknown>,
  expressionAttributeNames?: Record<string, string>,
  conditionExpression?: string,
): Promise<Record<string, unknown> | undefined> {
  const params: UpdateCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
    ...(expressionAttributeNames && { ExpressionAttributeNames: expressionAttributeNames }),
    ...(conditionExpression && { ConditionExpression: conditionExpression }),
  };
  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes as Record<string, unknown> | undefined;
}

export async function transactWrite(
  items: TransactWriteCommandInput['TransactItems'],
): Promise<void> {
  await docClient.send(
    new TransactWriteCommand({
      TransactItems: items,
    }),
  );
}

export { TABLE_NAME };
