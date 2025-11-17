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
        const response = await request(app).get('/books/');

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

describe('GET /books/:bookId', () => {
    let app;
    let apiClient;

    beforeAll(async () => {
        const setup = await setupMockedApp();
        app = setup.app;
        apiClient = setup.apiClient;
    });

    beforeEach(() => {
        apiClient.getBookById.mockClear();
    });

    describe('When the book exists', () => {
        it('should respond with 200 OK and display the book details', async () => {
            // GIVEN a mock book
            const bookId = '123e4567-e89b-12d3-a456-426614174000';
            const mockBook = {
                id: bookId,
                title: 'The Lord of the Rings',
                author: 'J.R.R. Tolkien',
                synopsis: 'An epic adventure in Middle-earth.',
            };

            // AND a mock apiClient that will return it
            apiClient.getBookById.mockResolvedValue(mockBook);

            // WHEN a request is made to the mock book's endpoint
            const response = await request(app).get(`/books/${bookId}`);

            // THEN The response should be successful and contain the book's data
            expect(response.statusCode).toBe(200);
            expect(response.text).toMatch(/<title>The Lord of the Rings - GOV.UK<\/title>/);
            expect(response.text).toMatch(/<h1.*>The Lord of the Rings<\/h1>/);
            expect(response.text).toMatch(/J\.R\.R\. Tolkien/);
            expect(response.text).toMatch(/An epic adventure in Middle-earth\./);

            // AND the mock object should have been called correctly
            expect(apiClient.getBookById).toHaveBeenCalledTimes(1);
            expect(apiClient.getBookById).toHaveBeenCalledWith(bookId);
            });
    });
});
