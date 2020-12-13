import response from './response';

describe('API Response Tests', () => {
  test('Should return a default success response', () => {
    const expectedResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {},
        data: {},
      })
    }
  });
});