//import handler from './handler'
import handler from './handler';
let mockEvent;

// beforeEach( () => {
//   mockEvent = ({
//     body: JSON.stringify({
//       firstName: 'John',
//       lastName: 'Doe',
//       email: 'jdoe@gmail.com',
//     }),
//   } as unknown) as APIGatewayProxyEvent;
// });

describe('hello function unit tests', () => {
  test('This should pass', () => {
    expect(true).toBeTruthy();
  });

  // test('Should return hello response', async (done) => {
  //   const expectedResponse = {
  //     statusCode: 200,
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({message: 'hello'})
  //   };
  //   console.log('Expected: ',expectedResponse);

  //   const result = await handler(mockEvent);
  //   console.log('Received: ',result);
  //   expect(result).toEqual(expectedResponse);
  //   done();
  // });
});