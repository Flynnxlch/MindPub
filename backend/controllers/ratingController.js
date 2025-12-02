const Rating = require('../models/Rating');

class RatingController {
  // Get user's rating untuk book
  static async getUserRating(req, res) {
    try {
      const { bookId } = req.params;
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const rating = await Rating.getUserRating(user_id, bookId);
      
      res.json({
        success: true,
        rating
      });
      
    } catch (error) {
      console.error('Get rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching rating',
        error: error.message
      });
    }
  }

  // Create or update rating
  static async upsertRating(req, res) {
    try {
      const { user_id, bookId, rating } = req.body;
      
      if (!user_id || !bookId || !rating) {
        return res.status(400).json({
          success: false,
          message: 'user_id, bookId, and rating are required'
        });
      }
      
      // Validate rating value
      if (rating < 0.5 || rating > 5.0) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 0.5 and 5.0'
        });
      }
      
      await Rating.upsert(user_id, bookId, rating);
      const userRating = await Rating.getUserRating(user_id, bookId);
      
      res.json({
        success: true,
        message: 'Rating saved successfully',
        rating: userRating
      });
      
    } catch (error) {
      console.error('Upsert rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving rating',
        error: error.message
      });
    }
  }

  // Delete rating
  static async deleteRating(req, res) {
    try {
      const { bookId } = req.params;
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const success = await Rating.delete(user_id, bookId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Rating deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting rating',
        error: error.message
      });
    }
  }

  // Get all ratings untuk book
  static async getBookRatings(req, res) {
    try {
      const { bookId } = req.params;
      const ratings = await Rating.getBookRatings(bookId);
      
      res.json({
        success: true,
        ratings
      });
      
    } catch (error) {
      console.error('Get book ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching book ratings',
        error: error.message
      });
    }
  }
}

module.exports = RatingController;

