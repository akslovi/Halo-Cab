const express = require('express');
const RideService = require('../services/rideService');
const Rating = require('../models/Rating');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const { protect, authorize } = require('../middleware/auth');
const { estimateValidator, bookRideValidator, rideIdValidator } = require('../middleware/validators');
const logger = require('../utils/logger');

const router = express.Router();

// All ride routes require authentication
router.use(protect);
router.use(authorize('user', 'admin'));

// @route   POST /api/rides/estimate
// @desc    Get fare estimate
// @access  Private (User)
router.post('/estimate', estimateValidator, async (req, res, next) => {
  try {
    const { pickup, drop, vehicleType, couponCode } = req.body;
    const estimate = await RideService.getEstimate(pickup, drop, vehicleType, couponCode);

    res.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/rides/book
// @desc    Book a ride
// @access  Private (User)
router.post('/book', bookRideValidator, async (req, res, next) => {
  try {
    const ride = await RideService.bookRide(req.user._id, req.body);

    // Emit ride request to nearby drivers via socket
    const io = req.app.get('io');
    if (io) {
      const nearbyDrivers = await RideService.findNearbyDrivers(
        req.body.pickup.lng,
        req.body.pickup.lat,
        req.body.vehicleType
      );

      nearbyDrivers.forEach((driver) => {
        io.to(`driver_${driver._id}`).emit('ride_request', {
          ride: ride,
          pickup: req.body.pickup,
          drop: req.body.drop,
        });
      });

      logger.info(`Ride request sent to ${nearbyDrivers.length} nearby drivers`);
    }

    res.status(201).json({
      success: true,
      data: { ride },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/rides/schedule
// @desc    Schedule a ride for later
// @access  Private (User)
router.post('/schedule', bookRideValidator, async (req, res, next) => {
  try {
    if (!req.body.scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'scheduledAt is required for scheduled rides',
      });
    }

    const scheduledDate = new Date(req.body.scheduledAt);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future',
      });
    }

    const ride = await RideService.bookRide(req.user._id, req.body);

    res.status(201).json({
      success: true,
      data: { ride },
      message: `Ride scheduled for ${scheduledDate.toLocaleString()}`,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/rides/:id/cancel
// @desc    Cancel a ride
// @access  Private (User)
router.put('/:id/cancel', rideIdValidator, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const ride = await RideService.updateRideStatus(req.params.id, 'cancelled', {
      cancelReason: reason || 'Cancelled by user',
      cancelledBy: 'user',
    });

    // Notify driver
    const io = req.app.get('io');
    if (io && ride.driverId) {
      io.to(`driver_${ride.driverId}`).emit('ride_cancelled', { rideId: ride._id, reason });
    }

    res.json({
      success: true,
      data: { ride },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rides/:id
// @desc    Get ride details
// @access  Private
router.get('/:id', rideIdValidator, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name phone avatar' },
      })
      .populate('userId', 'name phone avatar');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    res.json({
      success: true,
      data: { ride },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rides/history
// @desc    Get ride history
// @access  Private (User)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await RideService.getUserRideHistory(req.user._id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/rides/:id/rate
// @desc    Rate a completed ride
// @access  Private (User)
router.post('/:id/rate', rideIdValidator, async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    if (ride.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed rides' });
    }
    if (ride.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ rideId: ride._id });
    if (existingRating) {
      return res.status(400).json({ success: false, message: 'Ride already rated' });
    }

    const newRating = await Rating.create({
      rideId: ride._id,
      userId: req.user._id,
      driverId: ride.driverId,
      rating,
      review: review || '',
    });

    // Update driver's average rating
    const allRatings = await Rating.find({ driverId: ride.driverId });
    const avgRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await Driver.findByIdAndUpdate(ride.driverId, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count': allRatings.length,
    });

    res.status(201).json({
      success: true,
      data: { rating: newRating },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
