const Bookmark = require('../models/Bookmark');

class BookmarkController {
  // Get user's bookmarks
  static async getUserBookmarks(req, res) {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const bookmarks = await Bookmark.getUserBookmarks(user_id);
      
      res.json({
        success: true,
        bookmarks
      });
      
    } catch (error) {
      console.error('Get bookmarks error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching bookmarks',
        error: error.message
      });
    }
  }

  // Create bookmark
  static async createBookmark(req, res) {
    try {
      const { user_id, bookId } = req.body;
      
      if (!user_id || !bookId) {
        return res.status(400).json({
          success: false,
          message: 'user_id and bookId are required'
        });
      }
      
      // Check if already bookmarked
      const exists = await Bookmark.exists(user_id, bookId);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Book already bookmarked'
        });
      }
      
      const bookmarkId = await Bookmark.create(user_id, bookId);
      
      res.status(201).json({
        success: true,
        message: 'Bookmark created successfully',
        bookmarkId
      });
      
    } catch (error) {
      console.error('Create bookmark error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating bookmark',
        error: error.message
      });
    }
  }

  // Delete bookmark
  static async deleteBookmark(req, res) {
    try {
      const { bookId } = req.params;
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const success = await Bookmark.delete(user_id, bookId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Bookmark not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Bookmark deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete bookmark error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting bookmark',
        error: error.message
      });
    }
  }

  // Toggle bookmark
  static async toggleBookmark(req, res) {
    try {
      const { user_id, bookId } = req.body;
      
      if (!user_id || !bookId) {
        return res.status(400).json({
          success: false,
          message: 'user_id and bookId are required'
        });
      }
      
      const exists = await Bookmark.exists(user_id, bookId);
      
      if (exists) {
        await Bookmark.delete(user_id, bookId);
        res.json({
          success: true,
          message: 'Bookmark removed',
          bookmarked: false
        });
      } else {
        await Bookmark.create(user_id, bookId);
        res.json({
          success: true,
          message: 'Bookmark added',
          bookmarked: true
        });
      }
      
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling bookmark',
        error: error.message
      });
    }
  }
}

module.exports = BookmarkController;

