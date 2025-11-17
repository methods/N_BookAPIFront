import request from 'supertest';
import { setupMockedApp } from '../helpers/testSetup.js';

const mockApiResponse = {
    items: [
        {
        id: '123-abc',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        synopsis: 'A novel about all the choices that go into a life well lived.',
        links: { self: '/books/123-abc' },
        },
        {
        id: '456-def',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        synopsis: 'A lone astronaut must save the Earth from disaster.',
        links: { self: '/books/456-def' },
        },
    ],
};

describe('GET /books', () => {

    let app;
    let apiClient;

    beforeAll(async () => {
        const setup = await setupMockedApp();
        app = setup.app;
        apiClient = setup.apiClient;
    });

    beforeEach(() => {
        apiClient.getBooks.mockClear();
    });

    it('should respond with 200 OK and display a list of books', async () => {

        // GIVEN a mock bookAPI response
        apiClient.getBooks.mockResolvedValue(mockApiResponse);

        // WHEN a GET request is made to the /books URL
        const response = await request(app).get('/books');

        // THEN the correct page should be served
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(/<title>Books - GOV.UK<\/title>/);
        expect(response.text).toMatch(/<h1.*>Books<\/h1>/);

        // AND the correct book data should be present
        expect(response.text).toMatch(/The Midnight Library/);
        expect(response.text).toMatch(/Matt Haig/);
        expect(response.text).toMatch(/Project Hail Mary/);
        expect(response.text).toMatch(/Andy Weir/);
  });
});