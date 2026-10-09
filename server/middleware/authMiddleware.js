const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect private routes by validating JWT tokens.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    // Check if Authorization header exists and follows Bearer schema
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token missing.'
      });
    }

    // Verify token & fetch user without password field
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = authMiddleware;

