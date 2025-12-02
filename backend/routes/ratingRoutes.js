const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/ratingController');

// GET /api/ratings/:bookId - Get user's rating for book
router.get('/:bookId', RatingController.getUserRating);

// GET /api/ratings/:bookId/all - Get all ratings for book
router.get('/:bookId/all', RatingController.getBookRatings);

// POST /api/ratings - Create or update rating
router.post('/', RatingController.upsertRating);

// DELETE /api/ratings/:bookId - Delete rating
router.delete('/:bookId', RatingController.deleteRating);

module.exports = router;

