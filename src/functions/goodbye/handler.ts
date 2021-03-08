/* eslint-disable arrow-body-style */
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import response from '../../lib/response';

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Entered /goodbye lambda function');
  
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
      connectTimeout: 200
    },
    maxRetries: 3
  };

  if (process.env.hasOwnProperty('AWS_SAM_LOCAL') && process.env['AWS_SAM_LOCAL']) {
    config['endpoint'] = 'http://dynamodb:8000';
  }

  AWS.config.update(config, true);

  console.log('Creating the DocumentClient');
  let dynamodb = new AWS.DynamoDB.DocumentClient();
  const table = 'greetings-db';
  const params = {
    TableName: table,
    Key:{
        "id": "goodbye",
        "lang": lang
    }
  };

  console.log('Calling dynamodb.get()')
  let results: any = {};
  try {
    results = await dynamodb.get(params).promise();
    console.log(results);
  } catch (err) {
    console.log('Uh oh entered the CATCH block');
    console.log(err);
    return Promise.resolve(response.error(500, {}));
  }

  //await new Promise(r => setTimeout(r, 5000));
  return Promise.resolve(response.success(200, {}, {message: results.Item!.greeting}));
};