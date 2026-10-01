const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 2. Check if user already exists with this email
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // 3. Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and save new user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    await newUser.save();

    // 5. Return success response (never return hashed password)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully! You can now log in.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // 2. Check if user exists
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3. Compare passwords using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Generate JWT token
    const payload = {
      id: user._id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // 5. Return token and basic user info
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user information
 * @access  Private (Protected by JWT middleware)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Auth /me Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile.'
    });
  }
});

module.exports = router;
