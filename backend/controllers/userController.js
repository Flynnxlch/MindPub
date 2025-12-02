const User = require('../models/User');

class UserController {
  // Get user profile
  static async getProfile(req, res) {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const user = await User.findById(user_id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        user
      });
      
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { user_id, username, bio } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      let avatar_url = null;
      if (req.file) {
        avatar_url = `/uploads/avatars/${req.file.filename}`;
      }
      
      const updateData = {
        username: username || (await User.findById(user_id)).username,
        bio: bio || '',
        avatar_url: avatar_url || (await User.findById(user_id)).avatar_url
      };
      
      const success = await User.update(user_id, updateData);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update profile'
        });
      }
      
      const user = await User.findById(user_id);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
      
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message
      });
    }
  }

  // Get user statistics
  static async getStats(req, res) {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const stats = await User.getStats(user_id);
      
      res.json({
        success: true,
        stats
      });
      
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }

  // Get all users (admin)
  static async getAllUsers(req, res) {
    try {
      const { page, limit } = req.query;
      
      const result = await User.findAll(
        parseInt(page) || 1,
        parseInt(limit) || 20
      );
      
      res.json({
        success: true,
        ...result
      });
      
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }
}

module.exports = UserController;

