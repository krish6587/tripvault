const mongoose = require('mongoose');
const Trip = require('../models/Trip');

// Helpers for validation and error formatting
const getUserId = (req) => (req.user._id || req.user.id).toString();

const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid start or end date format.';
    }
    if (end < start) {
      return 'End date cannot be earlier than start date.';
    }
  }
  return null;
};

const validateRating = (rating) => {
  if (rating === undefined || rating === null || rating === '') {
    return { valid: true, value: undefined };
  }
  const num = Number(rating);
  if (isNaN(num) || num < 1 || num > 5) {
    return { valid: false, message: 'Rating must be a number between 1 and 5.' };
  }
  return { valid: true, value: num };
};

const handleControllerError = (res, error, fallbackMessage) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  console.error(fallbackMessage, error.message);
  return res.status(500).json({ success: false, message: fallbackMessage });
};

/**
 * Validates ObjectId, fetches trip, and verifies user ownership.
 * Returns the trip document, or sends the appropriate error response and returns null.
 */
const findAndAuthorizeTrip = async (id, userId, action, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid trip ID format.' });
    return null;
  }

  const trip = await Trip.findById(id);
  if (!trip) {
    res.status(404).json({ success: false, message: 'Trip not found.' });
    return null;
  }

  if (trip.user.toString() !== userId) {
    res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to ${action} this trip.`
    });
    return null;
  }

  return trip;
};

/**
 * @desc    Create a new trip for the authenticated user
 * @route   POST /api/trips
 * @access  Private
 */
exports.createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, description, rating } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Trip title is required.' });
    }

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({ success: false, message: 'Destination is required.' });
    }

    const dateError = validateDateRange(startDate, endDate);
    if (dateError) {
      return res.status(400).json({ success: false, message: dateError });
    }

    const ratingCheck = validateRating(rating);
    if (!ratingCheck.valid) {
      return res.status(400).json({ success: false, message: ratingCheck.message });
    }

    const trip = new Trip({
      title: title.trim(),
      destination: destination.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      description: description ? description.trim() : '',
      rating: ratingCheck.value,
      coverImage: req.body.coverImage || '',
      photos: Array.isArray(req.body.photos) ? req.body.photos : [],
      user: getUserId(req)
    });

    const savedTrip = await trip.save();

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully.',
      trip: savedTrip
    });
  } catch (error) {
    return handleControllerError(res, error, 'Server error while creating trip.');
  }
};

/**
 * @desc    Get all trips belonging to the authenticated user (newest first)
 * @route   GET /api/trips
 * @access  Private
 */
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: getUserId(req) }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error('Get Trips Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching trips.'
    });
  }
};

/**
 * @desc    Get a single trip by ID (must belong to authenticated user)
 * @route   GET /api/trips/:id
 * @access  Private
 */
exports.getTripById = async (req, res) => {
  try {
    const trip = await findAndAuthorizeTrip(req.params.id, getUserId(req), 'access', res);
    if (!trip) return;

    return res.status(200).json({
      success: true,
      trip
    });
  } catch (error) {
    console.error('Get Trip By ID Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching trip.'
    });
  }
};

/**
 * @desc    Update a trip (must belong to authenticated user)
 * @route   PUT /api/trips/:id
 * @access  Private
 */
exports.updateTrip = async (req, res) => {
  try {
    const trip = await findAndAuthorizeTrip(req.params.id, getUserId(req), 'update', res);
    if (!trip) return;

    const { title, destination, startDate, endDate, description, rating } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Trip title cannot be empty.' });
      }
      trip.title = title.trim();
    }

    if (destination !== undefined) {
      if (typeof destination !== 'string' || !destination.trim()) {
        return res.status(400).json({ success: false, message: 'Destination cannot be empty.' });
      }
      trip.destination = destination.trim();
    }

    if (startDate !== undefined) {
      trip.startDate = startDate ? new Date(startDate) : null;
    }

    if (endDate !== undefined) {
      trip.endDate = endDate ? new Date(endDate) : null;
    }

    const dateError = validateDateRange(trip.startDate, trip.endDate);
    if (dateError) {
      return res.status(400).json({ success: false, message: dateError });
    }

    if (description !== undefined) {
      trip.description = description ? description.trim() : '';
    }

    if (rating !== undefined) {
      const ratingCheck = validateRating(rating);
      if (!ratingCheck.valid) {
        return res.status(400).json({ success: false, message: ratingCheck.message });
      }
      trip.rating = ratingCheck.value;
    }

    if (req.body.coverImage !== undefined) {
      trip.coverImage = req.body.coverImage;
    }

    if (Array.isArray(req.body.photos)) {
      trip.photos = req.body.photos;
    }

    const updatedTrip = await trip.save();

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully.',
      trip: updatedTrip
    });
  } catch (error) {
    return handleControllerError(res, error, 'Server error while updating trip.');
  }
};

/**
 * @desc    Upload a photo and attach Cloudinary URL to the trip
 * @route   POST /api/trips/:id/upload
 * @access  Private
 */
exports.uploadTripPhoto = async (req, res) => {
  try {
    const trip = await findAndAuthorizeTrip(req.params.id, getUserId(req), 'upload photo to', res);
    if (!trip) return;

    // Collect all uploaded files (from req.files.images, req.files.image, or req.file)
    const files = [];
    if (req.files) {
      if (Array.isArray(req.files.images)) files.push(...req.files.images);
      if (Array.isArray(req.files.image)) files.push(...req.files.image);
    }
    if (req.file) {
      files.push(req.file);
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one image file to upload.'
      });
    }

    // Determine Cloudinary image URLs
    const uploadedUrls = [];
    for (const f of files) {
      let imageUrl = f.path || f.secure_url;
      if (!imageUrl && f.buffer) {
        imageUrl = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
      }
      if (imageUrl) {
        uploadedUrls.push(imageUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process uploaded image(s).'
      });
    }

    // Append URLs to trip photos list
    if (!Array.isArray(trip.photos)) {
      trip.photos = [];
    }
    trip.photos.push(...uploadedUrls);

    // If trip does not yet have a cover image, or if explicitly requested, set as coverImage
    const setAsCover = req.body.isCover === 'true' || req.body.isCover === true || req.query.isCover === 'true' || !trip.coverImage;
    if (setAsCover && uploadedUrls.length > 0) {
      trip.coverImage = uploadedUrls[0];
    }

    const updatedTrip = await trip.save();

    return res.status(200).json({
      success: true,
      message: `${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} uploaded successfully.`,
      imageUrl: uploadedUrls[0],
      photoUrls: uploadedUrls,
      trip: updatedTrip
    });
  } catch (error) {
    return handleControllerError(res, error, 'Server error while uploading photo(s).');
  }
};

/**
 * @desc    Delete a trip (must belong to authenticated user)
 * @route   DELETE /api/trips/:id
 * @access  Private
 */
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await findAndAuthorizeTrip(req.params.id, getUserId(req), 'delete', res);
    if (!trip) return;

    await Trip.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Trip Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting trip.'
    });
  }
};


