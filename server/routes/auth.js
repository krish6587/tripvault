const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client();

// Email & Password Validation Regexes
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/;

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

/**
 * Helper to ensure a unique username is generated if not provided
 */
const generateUniqueUsername = async (base) => {
  let clean = (base || 'traveler').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20) || 'traveler';
  if (clean.length < 3) clean += '123';
  let candidate = clean;
  let suffix = 1;
  while (await User.findOne({ username: candidate })) {
    candidate = `${clean}${suffix++}`;
  }
  return candidate;
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // 1. Validate data types
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password must be valid strings.'
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Validate non-empty fields
    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    // 3. Validate email format
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // 4. Validate strong password
    if (!STRONG_PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
      });
    }

    // 5. Validate username
    let finalUsername;
    if (username && typeof username === 'string' && username.trim()) {
      const normalizedUsername = username.trim().toLowerCase();
      if (!USERNAME_REGEX.test(normalizedUsername)) {
        return res.status(400).json({
          success: false,
          message: 'Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens.'
        });
      }
      const existingUsername = await User.findOne({ username: normalizedUsername });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'This username is already taken. Please choose another username.'
        });
      }
      finalUsername = normalizedUsername;
    } else {
      // Auto-generate unique username from email prefix
      finalUsername = await generateUniqueUsername(normalizedEmail.split('@')[0]);
    }

    // 6. Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // 7. Hash password using bcryptjs (salt factor 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Create and save new user
    const newUser = await User.create({
      name: trimmedName,
      username: finalUsername,
      email: normalizedEmail,
      password: hashedPassword
    });

    // 9. Return response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully! You can now log in.',
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio || '',
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = error.keyPattern?.username ? 'username' : 'email';
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists.`
      });
    }

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

    // 1. Validate data types
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password must be valid strings.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Validate non-empty fields
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // 3. Validate email format
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // 4. Find user and verify password
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Ensure existing user has a username
    if (!user.username) {
      user.username = await generateUniqueUsername(user.email.split('@')[0]);
      await user.save();
    }

    // 5. Issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        email: user.email,
        avatar: user.avatar || ''
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
 * @route   POST /api/auth/google
 * @desc    Verify Google ID Token & authenticate user
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token (credential) is required.'
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in server/.env file.'
      });
    }

    // Verify Google ID token with Google API
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google ID token payload.'
      });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google email address is not verified.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayName = (name || email.split('@')[0]).trim();

    // Find or create user in MongoDB
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }]
    });

    if (!user) {
      const generatedUsername = await generateUniqueUsername(displayName || email.split('@')[0]);
      user = await User.create({
        name: displayName,
        username: generatedUsername,
        email: normalizedEmail,
        googleId,
        avatar: picture || ''
      });
    } else {
      let updated = false;
      if (!user.username) {
        user.username = await generateUniqueUsername(user.name || user.email.split('@')[0]);
        updated = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // Sign JWT token for TripVault session
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        email: user.email,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('Google ID Token Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Failed to verify Google ID token. ' + (error.message || 'Please try again.')
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user information
 * @access  Private (Protected by JWT authMiddleware)
 */
router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;

