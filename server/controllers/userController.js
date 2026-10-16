const User = require('../models/User');
const Trip = require('../models/Trip');

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

/**
 * @desc    Get public user profile and their trips
 * @route   GET /api/users/:username/profile
 * @access  Public (No Auth Required)
 */
exports.getPublicProfile = async (req, res) => {
  try {
    const rawUsername = req.params.username;
    if (!rawUsername || typeof rawUsername !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Username parameter is required.'
      });
    }

    const trimmedUsername = rawUsername.trim().toLowerCase();

    // Query user and explicitly select ONLY safe, non-sensitive public fields
    const user = await User.findOne({ username: trimmedUsername }).select(
      'name username bio avatar createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User '${rawUsername}' not found.`
      });
    }

    // Fetch all trips created by this user (public view)
    const trips = await Trip.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select('title destination startDate endDate description rating coverImage photos createdAt');

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        avatar: user.avatar || '',
        createdAt: user.createdAt
      },
      trips
    });
  } catch (error) {
    console.error('Get Public Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching public profile.'
    });
  }
};

/**
 * @desc    Update current logged-in user profile (bio, username, name)
 * @route   PUT /api/users/profile
 * @access  Private (JWT Protected)
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const { bio, username, name } = req.body;

    // 1. Update username if provided
    if (username !== undefined) {
      if (typeof username !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Username must be a valid string.'
        });
      }

      const normalizedUsername = username.trim().toLowerCase();

      if (!USERNAME_REGEX.test(normalizedUsername)) {
        return res.status(400).json({
          success: false,
          message: 'Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens.'
        });
      }

      // Check for collision with another user's username
      const existingUser = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'This username is already taken. Please choose another one.'
        });
      }

      user.username = normalizedUsername;
    }

    // 2. Update bio if provided
    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Bio must be a valid string.'
        });
      }

      if (bio.length > 300) {
        return res.status(400).json({
          success: false,
          message: 'Bio cannot exceed 300 characters.'
        });
      }

      user.bio = bio.trim();
    }

    // 3. Update name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty.'
        });
      }
      user.name = name.trim();
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        email: updatedUser.email,
        avatar: updatedUser.avatar || ''
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken.'
      });
    }

    console.error('Update Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile.'
    });
  }
};
