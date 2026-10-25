const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  uploadTripPhoto
} = require('../controllers/tripController');
const { upload } = require('../middleware/upload');

// Protect alias for authMiddleware
const protect = authMiddleware;

// All trip routes are protected by authMiddleware
router.use(protect);

// Helper middleware to handle multer errors gracefully (supports multiple and single images)
const handleUpload = (req, res, next) => {
  upload.fields([
    { name: 'images', maxCount: 20 },
    { name: 'image', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum allowed size is 5MB per photo.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file.'
      });
    }
    next();
  });
};

// @route   POST /api/trips/:id/upload
// @desc    Upload a photo and attach Cloudinary URL to the trip
router.post('/:id/upload', protect, handleUpload, uploadTripPhoto);

// @route   POST /api/trips
// @desc    Create a new trip for the logged-in user
// @route   GET /api/trips
// @desc    Get all trips belonging to the logged-in user (newest first)
router.route('/')
  .post(createTrip)
  .get(getTrips);

// @route   GET /api/trips/:id
// @desc    Get a single trip by ID (ownership verified)
// @route   PUT /api/trips/:id
// @desc    Update a trip (ownership verified)
// @route   DELETE /api/trips/:id
// @desc    Delete a trip (ownership verified)
router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

module.exports = router;

