const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool } = require('./config');

const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, check, validationResult } = require('express-validator');

const isProduction = process.env.NODE_ENV === 'production';
const origin = {
    origin: isProduction ? 'https://exampla-node-api.herokuapp.com/' : '*',
};

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(origin));
app.use(compression());
app.use(helmet());
app.use(limiter);

const getBooks = (request, response) => {
    pool.query('SELECT * FROM books', (error, result) => {
        if (error) {
            throw error;
        }
        response.status(200).json(result.rows)
    })
};

const addBook = (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        return response.status(422).json({ error: errors.array() });
    }

    const { author, title } = request.body;

    pool.query('INSERT INTO books (author, title) VALUES ($1, $2)', [author, title], error => {
        if (error) {
            throw error;
        }
        response.status(201).json({status: 'success', message: 'Book added.'})
    })
};

const deleteBook = (request, response) => {
    if (!request.header('apiKey') || request.header('apiKey') !== process.env.API_KEY) {
        return response.status(401).json({ status: 'error', message: 'Unauthorized'})
    }

    const { id } = request.body;

    pool.query('DELETE FROM books WHERE id = $1', [id], error => {
        if (error) {
            throw error;
        }
        response.status(201).json({status: 'success', message: 'Book deleted.'})
    })
};

app
    .route('/books')
    .get(getBooks)
    .delete(deleteBook);

const postLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
});
const validationAddBook = [
    check('author')
        .not()
        .isEmpty()
        .isLength({ min:5, max: 255})
        .trim(),
    check('title')
        .not()
        .isEmpty()
        .isLength({ min:5, max: 255})
        .trim()
];
app.post('/books', validationAddBook, postLimiter, addBook);

app.listen(process.env.PORT || 3002, () => {
    console.log('Server listening')
});