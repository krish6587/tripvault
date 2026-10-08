const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');

// All trip routes are protected by authMiddleware
router.use(authMiddleware);

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
