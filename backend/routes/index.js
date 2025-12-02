const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const bookRoutes = require('./bookRoutes');
const readingRoutes = require('./readingRoutes');
const bookmarkRoutes = require('./bookmarkRoutes');
const ratingRoutes = require('./ratingRoutes');
const noteRoutes = require('./noteRoutes');
const ticketRoutes = require('./ticketRoutes');
const userRoutes = require('./userRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/reading', readingRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/ratings', ratingRoutes);
router.use('/notes', noteRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/leaderboard', leaderboardRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MindPub API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

