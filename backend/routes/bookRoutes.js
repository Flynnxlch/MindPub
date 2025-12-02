const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');
const { uploadBookWithCover, uploadCover, uploadBook } = require('../middleware/upload');

// GET /api/books - Get all books dengan filter
router.get('/', BookController.getAllBooks);

// GET /api/books/popular - Get popular books
router.get('/popular', BookController.getPopularBooks);

// GET /api/books/recommended - Get recommended books
router.get('/recommended', BookController.getRecommendedBooks);

// GET /api/books/categories - Get all categories
router.get('/categories', BookController.getCategories);

// POST /api/books/preview - Preview file metadata (before upload) - MUST BE BEFORE /:id routes
router.post('/preview', uploadBook, BookController.previewFile);

// GET /api/books/:id - Get book by ID
router.get('/:id', BookController.getBookById);

// GET /api/books/:id/pages/:page - Get specific page content
router.get('/:id/pages/:page', BookController.getBookPage);

// GET /api/books/:id/pages - Get page range
router.get('/:id/pages', BookController.getBookPageRange);

// POST /api/books - Create new book (with file upload)
router.post('/', uploadBookWithCover, BookController.createBook);

// PUT /api/books/:id - Update book
router.put('/:id', uploadCover, BookController.updateBook);

// DELETE /api/books/:id - Delete book
router.delete('/:id', BookController.deleteBook);

module.exports = router;

