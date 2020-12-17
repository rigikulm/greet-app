import { APIGatewayProxyEvent } from 'aws-lambda';
import handler from './handler';
let mockEvent: APIGatewayProxyEvent;

beforeEach( () => {
  mockEvent = ({
    body: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      email: 'jdoe@gmail.com',
    }),
  } as unknown) as APIGatewayProxyEvent;
});


describe('goodbye function unit tests', () => {
  test('This should pass', () => {
    expect(true).toBeTruthy();
  });

  test('Should return goodbye response', async (done) => {
    const expectedResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({message: 'goodbye'})
    };
    console.log(expectedResponse);

    const result = await handler(mockEvent);
    console.log(result);
    expect(result).toEqual(expectedResponse);
    done();
  });
});
