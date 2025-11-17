import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBookById, getBooks } from './apiClient.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const app = express ();

const viewPaths = [
    path.join(_dirname, 'views'),
    path.join(_dirname, '../node_modules/govuk-frontend/')
];
nunjucks.configure(
    viewPaths, {
        autoescape: true,
        express: app
    }
);

app.set('view engine', 'njk');

const govukPath = path.join(_dirname, '../node_modules/govuk-frontend/dist')
app.use('/govuk', express.static(govukPath));

app.get('/', (req, res) => {
    res.render('index.njk',  { pageTitle: 'Book API FrontEnd' });
});

app.get('/books', async (req, res) => {
    const booksData = await getBooks();

    res.render('books.njk', {
        pageTitle: 'Books',
        books: booksData.items,
    });
});

app.get('/books/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    const bookData = await getBookById(bookId);

    res.render('book-data.njk', {
        pageTitle: bookData.title,
        bookData,
    });
});

export default app;