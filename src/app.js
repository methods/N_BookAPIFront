import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';

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

export default app;