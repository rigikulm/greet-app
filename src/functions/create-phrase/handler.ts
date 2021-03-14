/* eslint-disable arrow-body-style */
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
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
  let lang = 'en';
  if (event.pathParameters && event.pathParameters.hasOwnProperty('lang')) {
    lang = <string>event.pathParameters.lang;
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
    Key: {
      id: { S: "hello" },
      lang: { S: lang }
    }
  };

  let results;
  try {
    log.info(`Calling dynamodb.get() with ${util.inspect(params)}`);
    results = await ddb.send(new PutItemCommand(params));
    if (results.Item) {
      log.info(httpStatus(200), `Success: lang: ${lang}, message: ${results.Item!.phrase}`);
      return Promise.resolve(response.success(200, {}, { message: results.Item!.phrase }));
    } else {
      log.warn(httpStatus(400), `Warning: lang: ${lang}, phrase: goodbye not found`);
      return Promise.resolve(response.error(400, {}, new Error(`Unable to find the requested phrase`)));
    }
  } catch (err) {
    log.error(errorStatus('DBERROR', util.inspect(err)), 'Unable to retrieve phrases');
    return Promise.resolve(response.error(500, {}));
  }

};
