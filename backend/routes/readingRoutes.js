const express = require('express');
const router = express.Router();
const ReadingController = require('../controllers/readingController');

// GET /api/reading/progress/:bookId - Get reading progress
router.get('/progress/:bookId', ReadingController.getProgress);

// PUT /api/reading/progress/:bookId - Update reading progress
router.put('/progress/:bookId', ReadingController.updateProgress);

// DELETE /api/reading/progress/:bookId - Delete reading progress
router.delete('/progress/:bookId', ReadingController.deleteProgress);

// GET /api/reading/recent - Get recent reads
router.get('/recent', ReadingController.getRecentReads);

// GET /api/reading/all - Get all user's reading progress
router.get('/all', ReadingController.getUserProgress);

module.exports = router;

