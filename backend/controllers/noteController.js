const Note = require('../models/Note');

class NoteController {
  // Get notes untuk book
  static async getBookNotes(req, res) {
    try {
      const { bookId } = req.params;
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const notes = await Note.getBookNotes(user_id, bookId);
      
      res.json({
        success: true,
        notes
      });
      
    } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching notes',
        error: error.message
      });
    }
  }

  // Get all user notes
  static async getUserNotes(req, res) {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const notes = await Note.getUserNotes(user_id);
      
      res.json({
        success: true,
        notes
      });
      
    } catch (error) {
      console.error('Get user notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user notes',
        error: error.message
      });
    }
  }

  // Create note
  static async createNote(req, res) {
    try {
      const { user_id, bookId, noteText, pageNumber } = req.body;
      
      if (!user_id || !bookId || !noteText) {
        return res.status(400).json({
          success: false,
          message: 'user_id, bookId, and noteText are required'
        });
      }
      
      const noteId = await Note.create(user_id, bookId, noteText, pageNumber);
      const note = await Note.findById(noteId);
      
      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        note
      });
      
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating note',
        error: error.message
      });
    }
  }

  // Update note
  static async updateNote(req, res) {
    try {
      const { id } = req.params;
      const { user_id, noteText } = req.body;
      
      if (!user_id || !noteText) {
        return res.status(400).json({
          success: false,
          message: 'user_id and noteText are required'
        });
      }
      
      const success = await Note.update(id, user_id, noteText);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or unauthorized'
        });
      }
      
      const note = await Note.findById(id);
      
      res.json({
        success: true,
        message: 'Note updated successfully',
        note
      });
      
    } catch (error) {
      console.error('Update note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating note',
        error: error.message
      });
    }
  }

  // Delete note
  static async deleteNote(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const success = await Note.delete(id, user_id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or unauthorized'
        });
      }
      
      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting note',
        error: error.message
      });
    }
  }
}

module.exports = NoteController;

