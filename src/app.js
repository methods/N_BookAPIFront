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

function transformBookLinks(book) {
    const relativeLinks = {};
    if (book.links) {
        for (const key in book.links) {
            const absoluteUrl = book.links[key];
            relativeLinks[key] = new URL(absoluteUrl).pathname;
        }
    }
    return {
        ...book,
        links: relativeLinks
    };
};

app.set('view engine', 'njk');

const govukPath = path.join(_dirname, '../node_modules/govuk-frontend/dist')
app.use('/govuk', express.static(govukPath));

app.get('/', (req, res) => {
    res.render('index.njk',  { pageTitle: 'Book API FrontEnd' });
});

app.get('/books', async (req, res) => {
    const booksData = await getBooks();

    const booksForView = booksData.items.map(transformBookLinks);

    res.render('books.njk', {
        pageTitle: 'Books',
        books: booksForView,
    });
});

app.get('/books/:bookId', async (req, res) => {
    const bookId = req.params.bookId;

    try {
        const bookData = await getBookById(bookId);
        const bookForView = transformBookLinks(bookData);

        res.render('book-data.njk', {
            pageTitle: bookForView.title,
            bookForView,
    });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).render('404.njk', { pageTitle: 'Page not found' });
        } else {
            res.status(500).render('500.njk', { pageTitle: 'Sorry, there is a problem with the service' });
        }
    }

});

export default app;