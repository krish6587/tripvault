const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getPublicProfile,
  updateUserProfile
} = require('../controllers/userController');

// @route   GET /api/users/:username/profile
// @desc    Get public user profile with their trips (No auth required)
router.get('/:username/profile', getPublicProfile);

// @route   PUT /api/users/profile
// @desc    Update logged-in user's bio or username (Auth required)
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
