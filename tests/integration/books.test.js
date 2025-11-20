import request from 'supertest';
import { setupMockedApp } from '../helpers/testSetup.js';

const mockApiResponse = {
    items: [
        {
        id: '123-abc',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        synopsis: 'A novel about all the choices that go into a life well lived.',
        links: {
            self: 'http://localhost:5003/books/123-abc',
            reservations: 'http://localhost:5003/books/123-abc/reservations' },
        },
        {
        id: '456-def',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        synopsis: 'A lone astronaut must save the Earth from disaster.',
        links: { 
            self: 'http://localhost:5003/books/456-def',
            reservations: 'http://localhost:5003/books/456-def/reservations' },
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
        // AND the book HATEOAS links should be present
        expect(response.text).toMatch(/<a.*href="\/books\/123-abc".*>The Midnight Library<\/a>/);
        expect(response.text).toMatch(/<a.*href="\/books\/123-abc\/reservations".*>Reservations<\/a>/);
        expect(response.text).toMatch(/<a.*href="\/books\/456-def".*>Project Hail Mary<\/a>/);
        expect(response.text).toMatch(/<a.*href="\/books\/456-def\/reservations".*>Reservations<\/a>/);
        expect(response.text).not.toMatch(/href="http:\/\/localhost:5003/);
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
                links: { 
                    self: `http://localhost:5003/books/${bookId}`,
                    reservations: `http://localhost:5003/books/${bookId}/reservations` },
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
            // AND the reservations link should be present and correctly formatted
            const expectedLinkPattern = `<a.*href="/books/${bookId}/reservations".*>Reservations</a>`;
            const regex = new RegExp(expectedLinkPattern);
            expect(response.text).toMatch(regex);

            // AND the mock object should have been called correctly
            expect(apiClient.getBookById).toHaveBeenCalledTimes(1);
            expect(apiClient.getBookById).toHaveBeenCalledWith(bookId);
            });
    });

    describe('When the book does not exist', () => {
        it('should respond with 404 Not Found and display an error page', async () => {
            // GIVEN a format-valid bookId for a book that does not exist
            const nonExistentBookId = '123e4567-e89b-12d3-a456-426614174000';

            // AND a mock API error
            const apiError = {
                response: {
                    status: 404
                }
            };

            // AND a mock apiClient that will return this error
            apiClient.getBookById.mockRejectedValue(apiError);

            // WHEN a request is made to the non-existent book's endpoint
            const response = await request(app).get(`/books/${nonExistentBookId}`);

            // THEN the response should be 404 Not Found and contain a user-friendly message
            expect(response.statusCode).toBe(404);
            expect(response.text).toMatch(/<h1.*>Page not found<\/h1>/);
            expect(response.text).toMatch(/If you typed the web address, check it is correct./);
    
            // AND the mock should have been called correctly
            expect(apiClient.getBookById).toHaveBeenCalledWith(nonExistentBookId);
        });
    });

    describe('when the backend API returns a server error', () => {
        it('should respond with 500 and display a generic error page', async () => {
            // GIVEN: a valid bookId
            const bookId = '123e4567-e89b-12d3-a456-426614174000';

            // AND: a mock API error that simulates a 500 Internal Server Error
            const mockApiError = {
            response: { 
                status: 500,
                data: { error: 'Something went wrong on the server' } 
            } 
            };
            // AND a mock client configured to return the Error
            apiClient.getBookById.mockRejectedValue(mockApiError);

            // WHEN a request is made to the endpoint
            const response = await request(app).get(`/books/${bookId}`);

            // THEN the response should be 500 and contain our user-friendly 500 message
            expect(response.statusCode).toBe(500);
            expect(response.text).toMatch(/<h1.*>Sorry, there is a problem with the service<\/h1>/);
            expect(response.text).toMatch(/Try again later\./);
            
            expect(apiClient.getBookById).toHaveBeenCalledWith(bookId);
  });
});
});
