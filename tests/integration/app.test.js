import request from 'supertest';
import app from '../../src/app.js'

describe(
    'GET /', () => {
        it('should response with status code 200', async () => {
            // GIVEN the express app is running
            // WHEN a GET request is made to the root URL
            const response = await request(app).get('/');
            // THEN the response should be 200 OK
            expect(response.statusCode).toBe(200);
            }
        );

        it('should respond with HTML containing the Gov.UK page title', async () => {
            // GIVEN the express app is running
            // WHEN a GET request is made to the root URL
            const response = await request(app).get('/');
            // THEN the response should contain the expected page title
            expect (response.text).toMatch(/<title>.*GOV.UK.*<\/title>/);
            }
        );
    }
)
