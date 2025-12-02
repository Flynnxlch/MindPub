const express = require('express');
const router = express.Router();
const BookmarkController = require('../controllers/bookmarkController');

// GET /api/bookmarks - Get user's bookmarks
router.get('/', BookmarkController.getUserBookmarks);

// POST /api/bookmarks - Create bookmark
router.post('/', BookmarkController.createBookmark);

// POST /api/bookmarks/toggle - Toggle bookmark
router.post('/toggle', BookmarkController.toggleBookmark);

// DELETE /api/bookmarks/:bookId - Delete bookmark
router.delete('/:bookId', BookmarkController.deleteBookmark);

module.exports = router;

