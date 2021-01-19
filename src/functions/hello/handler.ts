/* eslint-disable arrow-body-style */
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
//import {AWS, config, DynamoDB, ConfigurationOptions} from 'aws-sdk';
import AWS from 'aws-sdk';
import response from '../../lib/response';

// export default async handler = async (): Promise<APIGatewayProxyResult> => {
//   return { body: JSON.stringify({ message: 'hello' }), statusCode: 200 };
// };

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Entered /hello lambda function');

  // Change the connection to DynamoDB if we are running locally
  // AWS.config.update({
  //   region: 'us-west-2',
  //   logger: console,
  //   endpoint: 'http://localhost:8000',
  //   httpOptions: {
  //     connectTimeout: 500
  //   }
  // }, true);

  console.log('Creating the DocumentClient');
  let dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-west-2',
    endpoint: 'http://dynamodb:8000',
    logger: console,
    httpOptions: {
      connectTimeout: 500
    }
  });
  const table = 'greetings-db';
  const params = {
    TableName: table,
    Key:{
        "id": "hello",
        "lang": "de"
    }
  };

  dynamodb.get(params, (err, data) => {
    if (err) {
      console.log('Error from Dynamodb');
      console.log(err);
    } else {
      console.log('Yeah we got data');
      console.log(data);
    }
  });

  // console.log('Calling dynamodb.get()')
  // try {
  //   const results = await dynamodb.get(params).promise();
  //   console.log(results);
  // } catch (err) {
  //   console.log('Uh oh entered the CATCH block');
  //   console.log(err);
  //   return Promise.resolve(response.error(500, {}));
  // }


  // dynamodb.get(params).promise()
  // .then((data) => {
  //   console.log(data);
  //   return Promise.resolve(response.success(200, {}, {message: 'hello'}));
  // }).catch((err) => {
  //   console.log(err);
  //   return Promise.resolve(response.error(500, {}));
  // });
  await new Promise(r => setTimeout(r, 5000));
  return Promise.resolve(response.success(200, {}, {message: 'hello'}));
};
