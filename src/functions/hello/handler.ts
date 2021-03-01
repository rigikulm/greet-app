/* eslint-disable arrow-body-style */
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import {FaasLogger, httpStatus} from '@greenhorn/faas-logger';
//import {AWS, config, DynamoDB, ConfigurationOptions} from 'aws-sdk';
import AWS from 'aws-sdk';
import response from '../../lib/response';
import util from 'util';

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const log = new FaasLogger(event);
  log.info('Entered /hello lambda function');
  log.info(`Event: ${util.inspect(event)}`);

  // Default language binding
  let lang = 'en';
  if (event.pathParameters && event.pathParameters.hasOwnProperty('lang')) {
    lang = event.pathParameters.lang;
  }

  // Change the connection to DynamoDB if we are running locally
  let config: any = {
    region: 'us-west-2',
    logger: console,
    httpOptions: {
      connectTimeout: 200
    },
    maxRetries: 3
  };

  if (process.env.hasOwnProperty('AWS_SAM_LOCAL') && process.env['AWS_SAM_LOCAL']) {
    console.log('LOCAL INVOCATION');
    config['endpoint'] = 'http://dynamodb:8000';
  }
  AWS.config.update(config, true);

  log.info('Creating the DocumentClient ');
  // let dynamodb = new AWS.DynamoDB.DocumentClient({
  //   region: 'us-west-2',
  //   endpoint: 'http://dynamodb:8000',
  //   logger: console,
  //   httpOptions: {
  //     connectTimeout: 500
  //   }
  // });
  let dynamodb = new AWS.DynamoDB.DocumentClient();
  const table = 'greetings-db';
  const params = {
    TableName: table,
    Key:{
        "id": "hello",
        "lang": lang
    }
  };

  log.info('Calling dynamodb.get()')
  let results;
  try {
    results = await dynamodb.get(params).promise();
    //console.log(results);
  } catch (err) {
    console.log('Uh oh entered the CATCH block');
    console.log(err);
    return Promise.resolve(response.error(500, {}));
  }

  //await new Promise(r => setTimeout(r, 5000));
  log.info(httpStatus(200), `Success: lang: ${lang}, message: ${results.Item!.greeting}`);
  return Promise.resolve(response.success(200, {}, {message: results.Item!.greeting}));
};
