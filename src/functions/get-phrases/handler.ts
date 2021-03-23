/* eslint-disable arrow-body-style */
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { FaasLogger, httpStatus, errorStatus } from '@greenhorn/faas-logger';
import response from '../../lib/response';
import util from 'util';

let ddb: DynamoDBClient;
const ddbConfig: any = {
  region: 'us-west-2',
  logger: console,
  httpOptions: {
    connectTimeout: 100
  },
  maxRetries: 3
};

export default async (event: any, context: any) => {
  const log = new FaasLogger(event);
  log.info('Entered /phrase lambda function');

  // Default language binding
  let phraseId;
  if (event.pathParameters.hasOwnProperty('phraseId')) {
    phraseId = <string>event.pathParameters.phraseId;
  } else {
    log.error(errorStatus('BADQUERY', 'phraseId not specified'), 'Cannot access the requested phrase');
    return Promise.resolve(response.error(400, {}));
  }

  // Create the DynamoDBClient if it does not already exist.
  // If running locally dynamodb listening on local port 8000
  if (ddb === undefined) {
    if (process.env.hasOwnProperty('AWS_SAM_LOCAL') && process.env['AWS_SAM_LOCAL']) {
      ddbConfig['endpoint'] = 'http://dynamodb:8000';
      log.info(`SAM_LOCAL connecting to dynamo at ${ddbConfig.endpoint}`);
    }
    ddb = new DynamoDBClient(ddbConfig);
  }

  let tableName: string;
  // @TODO pass the table name via the environment
  if (process.env.hasOwnProperty('TABLE_NAME')) {
    tableName = <string>process.env['TABLE_NAME'];
  } else {
    log.error(errorStatus('BADENV', 'TABLE_NAME not defined in process.env'), 'Cannot access the greeting');
    return Promise.resolve(response.error(500, {}));
  }

  // GetItem query parameters
  const params: any = {
    TableName: tableName,
    KeyConditionExpression: "id = :phraseId",
    ExpressionAttributeValues: {
        ":phraseId": { S: phraseId}
    }
  };

  let results;
  let messages: any = [];
  try {
    log.info(`Calling dynamodb.query() with ${util.inspect(params)}`);
    results = await ddb.send(new QueryCommand(params));
    if (results.Items) {
        results.Items.forEach((item, index, array) => {
            messages.push(unmarshall(item));
        });
      log.info(httpStatus(200), `Success: message: ${util.inspect(messages)}`);
      return Promise.resolve(response.success(200, {}, { message: messages }));
    } else {
      log.warn(httpStatus(400), `Warning: phrase: ${phraseId} not found`);
      return Promise.resolve(response.error(400, {}, new Error(`Unable to find the requested phrase`)));
    }
  } catch (err) {
    log.error(errorStatus('DBERROR', util.inspect(err)), 'Unable to retrieve phrases');
    return Promise.resolve(response.error(500, {}));
  }

};
