const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { uploadAvatar } = require('../middleware/upload');

// GET /api/users/profile - Get user profile
router.get('/profile', UserController.getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', uploadAvatar, UserController.updateProfile);

// GET /api/users/stats - Get user statistics
router.get('/stats', UserController.getStats);

// GET /api/users/admin/all - Get all users (admin)
router.get('/admin/all', UserController.getAllUsers);

module.exports = router;

