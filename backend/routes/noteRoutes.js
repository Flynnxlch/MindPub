const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/noteController');

// GET /api/notes/book/:bookId - Get notes for specific book
router.get('/book/:bookId', NoteController.getBookNotes);

// GET /api/notes/user - Get all user's notes
router.get('/user', NoteController.getUserNotes);

// POST /api/notes - Create note
router.post('/', NoteController.createNote);

// PUT /api/notes/:id - Update note
router.put('/:id', NoteController.updateNote);

// DELETE /api/notes/:id - Delete note
router.delete('/:id', NoteController.deleteNote);

module.exports = router;

