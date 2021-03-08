/* eslint-disable arrow-body-style */
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { FaasLogger, httpStatus, errorStatus } from '@greenhorn/faas-logger';
//import {AWS, config, DynamoDB, ConfigurationOptions} from 'aws-sdk';
import AWS from 'aws-sdk';
import response from '../../lib/response';
import util from 'util';

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const log = new FaasLogger(event);
  log.info('Entered /hello lambda function');
  //log.info(`Event: ${util.inspect(event)}`);

  // Default language binding
  let lang = 'en';
  if (event.pathParameters && event.pathParameters.hasOwnProperty('lang')) {
    lang = <string>event.pathParameters.lang;
  }

  // Change the connection to DynamoDB if we are running locally
  let config: any = {
    region: 'us-west-2',
    logger: console,
    httpOptions: {
      connectTimeout: 100
    },
    maxRetries: 3
  };

  // If running locally dynamodb listening on local port 8000
  if (process.env.hasOwnProperty('AWS_SAM_LOCAL') && process.env['AWS_SAM_LOCAL']) {
    config['endpoint'] = 'http://dynamodb:8000';
    log.info(`SAM_LOCAL connecting to dynamo at ${config.endpoint}`);
  }
  AWS.config.update(config, true);

  
  let dynamodb = new AWS.DynamoDB.DocumentClient();
  console.log('=======');
  console.log(util.inspect(dynamodb, true, 4));
  console.log('======');
  let tableName :string = '';
  // @TODO pass the table name via the environment
  if (process.env.hasOwnProperty('TABLE_NAME')) {
    tableName = <string>process.env['TABLE_NAME'];
  } else {
    log.error(errorStatus('BADENV', 'TABLE_NAME not defined in process.env'), 'Cannot access the greeting');
    return Promise.resolve(response.error(500, {}));
  }
  //const table = 'greetings-db-dev';
  const params = {
    TableName: "greetings-db-dev",
    Key:{
        "id": "hello",
        "lang": lang
    }
  };

  log.info(`Calling dynamodb.get() with ${util.inspect(params)}`);
  let results;
  try {
    results = await dynamodb.get(params).promise();
    //console.log(results);
  } catch (err) {
    log.error(errorStatus('DBERROR', util.inspect(err)), 'Unable to retrieve phrases');
    return Promise.resolve(response.error(500, {}));
  }

  //await new Promise(r => setTimeout(r, 5000));
  log.info(httpStatus(200), `Success: lang: ${lang}, message: ${results.Item!.phrase}`);
  return Promise.resolve(response.success(200, {}, {message: results.Item!.phrase}));
};
