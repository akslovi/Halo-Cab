const express = require('express');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const RideService = require('../services/rideService');
const { protect, authorize } = require('../middleware/auth');
const { kycValidator, locationValidator, rideIdValidator } = require('../middleware/validators');
const logger = require('../utils/logger');

const router = express.Router();

// All driver routes require auth + driver role
router.use(protect);
router.use(authorize('driver', 'admin'));

// @route   POST /api/drivers/kyc
// @desc    Submit KYC and vehicle details
// @access  Private (Driver)
router.post('/kyc', kycValidator, async (req, res, next) => {
  try {
    const { vehicleType, vehicle, kyc } = req.body;

    let driver = await Driver.findOne({ userId: req.user._id });

    if (driver) {
      // Update existing
      driver.vehicleType = vehicleType;
      driver.vehicle = vehicle;
      driver.kyc = { ...driver.kyc, ...kyc, status: 'pending' };
      await driver.save();
    } else {
      // Create new driver profile
      driver = await Driver.create({
        userId: req.user._id,
        vehicleType,
        vehicle,
        kyc: { ...kyc, status: 'pending' },
      });
    }

    logger.info(`KYC submitted by driver ${req.user._id}`);

    res.status(201).json({
      success: true,
      data: { driver },
      message: 'KYC submitted for review',
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/drivers/toggle-online
// @desc    Toggle online/offline status
// @access  Private (Driver)
router.put('/toggle-online', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found. Complete KYC first.',
      });
    }

    if (driver.kyc.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'KYC must be approved before going online',
      });
    }

    driver.isOnline = !driver.isOnline;
    if (driver.isOnline) {
      driver.lastOnlineAt = new Date();
    }
    await driver.save();

    // Notify system about driver status change
    const io = req.app.get('io');
    if (io) {
      io.emit('driver_status_change', {
        driverId: driver._id,
        isOnline: driver.isOnline,
      });
    }

    logger.info(`Driver ${driver._id} is now ${driver.isOnline ? 'online' : 'offline'}`);

    res.json({
      success: true,
      data: { isOnline: driver.isOnline },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/drivers/location
// @desc    Update current location
// @access  Private (Driver)
router.put('/location', locationValidator, async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { userId: req.user._id },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    res.json({
      success: true,
      data: { location: { lat, lng } },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/drivers/ride-requests
// @desc    Get pending ride requests nearby
// @access  Private (Driver)
router.get('/ride-requests', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    const rides = await Ride.find({
      status: 'requested',
      vehicleType: driver.vehicleType,
    })
      .populate('userId', 'name phone avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: { rides },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/drivers/rides/:id/accept
// @desc    Accept a ride
// @access  Private (Driver)
router.put('/rides/:id/accept', rideIdValidator, async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    const ride = await RideService.acceptRide(req.params.id, driver._id);
    const populatedRide = await Ride.findById(ride._id).populate('userId', 'name phone avatar');

    // Notify user that driver accepted
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.userId}`).emit('ride_accepted', {
        ride: populatedRide,
        driver: {
          id: driver._id,
          name: req.user.name,
          phone: req.user.phone,
          vehicle: driver.vehicle,
          rating: driver.rating,
          location: driver.currentLocation.coordinates,
        },
      });
    }

    res.json({
      success: true,
      data: { ride: populatedRide },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/drivers/rides/:id/reject
// @desc    Reject a ride
// @access  Private (Driver)
router.put('/rides/:id/reject', rideIdValidator, async (req, res, next) => {
  try {
    // Simply acknowledge the rejection - ride stays in 'requested' state
    logger.info(`Driver ${req.user._id} rejected ride ${req.params.id}`);

    res.json({
      success: true,
      message: 'Ride rejected',
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/drivers/rides/:id/arriving
// @desc    Mark as arriving to pickup
// @access  Private (Driver)
router.put('/rides/:id/arriving', rideIdValidator, async (req, res, next) => {
  try {
    const ride = await RideService.updateRideStatus(req.params.id, 'arriving');

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.userId}`).emit('ride_status_update', {
        rideId: ride._id,
        status: 'arriving',
      });
    }

    res.json({ success: true, data: { ride } });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/drivers/rides/:id/arrived
// @desc    Mark as arrived at pickup
// @access  Private (Driver)
router.put('/rides/:id/arrived', rideIdValidator, async (req, res, next) => {
  try {
    const ride = await RideService.updateRideStatus(req.params.id, 'arrived');

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.userId}`).emit('ride_status_update', {
        rideId: ride._id,
        status: 'arrived',
        message: 'Your driver has arrived!',
      });
    }

    res.json({ success: true, data: { ride } });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/drivers/rides/:id/start
// @desc    Start ride (verify OTP)
// @access  Private (Driver)
router.put('/rides/:id/start', rideIdValidator, async (req, res, next) => {
  try {
    const { otp } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const updatedRide = await RideService.updateRideStatus(req.params.id, 'started');

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.userId}`).emit('ride_status_update', {
        rideId: ride._id,
        status: 'started',
        message: 'Your ride has started!',
      });
    }

    res.json({ success: true, data: { ride: updatedRide } });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/drivers/rides/:id/complete
// @desc    Complete ride
// @access  Private (Driver)
router.put('/rides/:id/complete', rideIdValidator, async (req, res, next) => {
  try {
    const ride = await RideService.updateRideStatus(req.params.id, 'completed');

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.userId}`).emit('ride_completed', {
        ride,
        message: 'Your ride is complete! Please rate your driver.',
      });
    }

    res.json({ success: true, data: { ride } });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/drivers/earnings
// @desc    Get earnings dashboard
// @access  Private (Driver)
router.get('/earnings', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    // Get ride stats
    const completedRides = await Ride.find({
      driverId: driver._id,
      status: 'completed',
    }).sort({ completedAt: -1 }).limit(20);

    res.json({
      success: true,
      data: {
        earnings: driver.earnings,
        totalRides: driver.totalRides,
        rating: driver.rating,
        recentRides: completedRides,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/drivers/profile
// @desc    Get driver profile
// @access  Private (Driver)
router.get('/profile', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone avatar');
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    res.json({
      success: true,
      data: { driver },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/drivers/rides
// @desc    Get driver's ride history
// @access  Private (Driver)
router.get('/rides', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await RideService.getDriverRideHistory(driver._id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
