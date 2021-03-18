/* eslint-disable arrow-body-style */
import { DynamoDBClient, PutItemCommand, PutItemCommandInput, PutItemCommandOutput} from '@aws-sdk/client-dynamodb';
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
  log.info(`Event--> ${util.inspect(event)}`);

  // @todo Improve validation logic and code
  // Hack validation code
  if (!event.hasOwnProperty('id') || !event.hasOwnProperty('lang') || !event.hasOwnProperty('phrase')) {
    log.warn(httpStatus(400), 'Invalid post parameters. Phrase not created.');
    return Promise.resolve(response.error(400, {}, new Error(`Invalid post parameters. Phrase not created.`)));
  }
  const {id, lang, phrase} = event;

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

  // PutItem parameters
  const params: PutItemCommandInput = {
    TableName: tableName,
    Item: {
      id: { S: id },
      lang: { S: lang },
      phrase: {S: phrase}
    }
  };

  let results;
  try {
    log.info(`Calling ddb.send(PutItemCommand()) with ${util.inspect(params)}`);
    results = await ddb.send(new PutItemCommand(params));
    if (results) {
      log.info(httpStatus(200), `Success: message: ${results}`);
      return Promise.resolve(response.success(200, {}, { message: results }));
    } else {
      log.warn(httpStatus(400), `Warning: phrase: goodbye not found`);
      return Promise.resolve(response.error(400, {}, new Error(`Unable to find the requested phrase`)));
    }
  } catch (err) {
    log.error(errorStatus('DBERROR', util.inspect(err)), 'Unable to retrieve phrases');
    return Promise.resolve(response.error(500, {}));
  }

};
