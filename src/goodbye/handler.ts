/* eslint-disable arrow-body-style */
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import response from '../lib/response';

// export default async handler = async (): Promise<APIGatewayProxyResult> => {
//   return { body: JSON.stringify({ message: 'hello' }), statusCode: 200 };
// };

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//  return Promise.resolve({ body: JSON.stringify({ message: 'goodbye' }), statusCode: 200 });
  return Promise.resolve(response.success(200, {}, {message: 'goodbye'}));
};