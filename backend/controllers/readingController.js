const ReadingProgress = require('../models/ReadingProgress');
const Book = require('../models/Book');
const User = require('../models/User');

class ReadingController {
  // Get reading progress untuk book tertentu
  static async getProgress(req, res) {
    try {
      const { bookId } = req.params;
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const progress = await ReadingProgress.getProgress(user_id, bookId);
      
      if (!progress) {
        return res.json({
          success: true,
          progress: null,
          message: 'No progress found'
        });
      }
      
      res.json({
        success: true,
        progress
      });
      
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching progress',
        error: error.message
      });
    }
  }

  // Update reading progress
  static async updateProgress(req, res) {
    try {
      const { bookId } = req.params;
      const { user_id, currentPage, furthestPage, totalPages } = req.body;
      
      if (!user_id || !currentPage || !furthestPage || !totalPages) {
        return res.status(400).json({
          success: false,
          message: 'user_id, currentPage, furthestPage, and totalPages are required'
        });
      }
      
      // Get previous progress untuk cek furthest page
      const prevProgress = await ReadingProgress.getProgress(user_id, bookId);
      const prevFurthestPage = prevProgress?.furthest_page || 0;
      
      // Update progress
      await ReadingProgress.upsert(user_id, bookId, {
        currentPage,
        furthestPage,
        totalPages
      });
      
      // Update user statistics jika furthest page bertambah
      if (furthestPage > prevFurthestPage) {
        const pagesIncrement = furthestPage - prevFurthestPage;
        await User.updatePagesRead(user_id, pagesIncrement);
      }
      
      // Update books finished jika selesai
      const isFinished = furthestPage >= totalPages;
      if (isFinished && !prevProgress?.is_finished) {
        await User.incrementBooksFinished(user_id);
      }
      
      // Increment total reads untuk book (hanya sekali per user)
      if (!prevProgress) {
        await Book.incrementReads(bookId);
      }
      
      const progress = await ReadingProgress.getProgress(user_id, bookId);
      
      res.json({
        success: true,
        message: 'Progress updated successfully',
        progress
      });
      
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating progress',
        error: error.message
      });
    }
  }

  // Get recent reads
  static async getRecentReads(req, res) {
    try {
      const { user_id } = req.query;
      const limit = parseInt(req.query.limit) || 6;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const books = await ReadingProgress.getRecentReads(user_id, limit);
      
      res.json({
        success: true,
        books
      });
      
    } catch (error) {
      console.error('Get recent reads error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching recent reads',
        error: error.message
      });
    }
  }

  // Get all user's reading progress
  static async getUserProgress(req, res) {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const books = await ReadingProgress.getUserProgress(user_id);
      
      res.json({
        success: true,
        books
      });
      
    } catch (error) {
      console.error('Get user progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user progress',
        error: error.message
      });
    }
  }

  // Delete reading progress
  static async deleteProgress(req, res) {
    try {
      const { bookId } = req.params;
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const success = await ReadingProgress.delete(user_id, bookId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Progress not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Progress deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting progress',
        error: error.message
      });
    }
  }
}

module.exports = ReadingController;

