const express = require('express');
const router = express.Router();
const LeaderboardController = require('../controllers/leaderboardController');

// GET /api/leaderboard/books - Get top rated books
router.get('/books', LeaderboardController.getTopBooks);

// GET /api/leaderboard/users - Get top users
router.get('/users', LeaderboardController.getTopUsers);

// GET /api/leaderboard/stats - Get platform statistics
router.get('/stats', LeaderboardController.getPlatformStats);

module.exports = router;

