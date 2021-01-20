/* eslint-disable arrow-body-style */
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import response from '../../lib/response';

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Entered /goodbye lambda function');

  // Change the connection to DynamoDB if we are running locally
  AWS.config.update({
    region: 'us-west-2',
    logger: console,
    endpoint: 'http://dynamodb:8000',
    httpOptions: {
      connectTimeout: 200
    },
    maxRetries: 3
  }, true);

  console.log('Creating the DocumentClient');
  let dynamodb = new AWS.DynamoDB.DocumentClient();
  const table = 'greetings-db';
  const params = {
    TableName: table,
    Key:{
        "id": "goodbye",
        "lang": "de"
    }
  };

  console.log('Calling dynamodb.get()')
  let results: any = {};
  try {
    results = await dynamodb.get(params).promise();
    if ( !results.hasOwnProperty('Info')) {
      console.log(`${params.Key} not found`);
      return Promise.resolve(response.error(400, {}));
    }
    console.log(results);
  } catch (err) {
    console.log('Uh oh entered the CATCH block');
    console.log(err);
    return Promise.resolve(response.error(500, {}));
  }

  //await new Promise(r => setTimeout(r, 5000));
  return Promise.resolve(response.success(200, {}, {message: results.Item!.greeting}));
};