const express = require('express');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const PricingService = require('../services/pricingService');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDrivers,
      activeDrivers,
      totalRides,
      activeRides,
      completedRides,
      cancelledRides,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Driver.countDocuments(),
      Driver.countDocuments({ isOnline: true }),
      Ride.countDocuments(),
      Ride.countDocuments({ status: { $in: ['requested', 'accepted', 'arriving', 'arrived', 'started'] } }),
      Ride.countDocuments({ status: 'completed' }),
      Ride.countDocuments({ status: 'cancelled' }),
    ]);

    // Revenue calculation
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRides = await Ride.countDocuments({ createdAt: { $gte: today } });
    const todayRevenueResult = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

    // Recent rides
    const recentRides = await Ride.find()
      .populate('userId', 'name email')
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Revenue by day (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const revenueByDay = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalDrivers,
          activeDrivers,
          totalRides,
          activeRides,
          completedRides,
          cancelledRides,
          totalRevenue,
          todayRides,
          todayRevenue,
        },
        recentRides,
        revenueByDay,
        surgeConfig: PricingService.getSurgeConfig(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/users
// @desc    List all users
// @access  Private (Admin)
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const filter = { role: 'user' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: { users, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/users/:id/toggle-active
// @desc    Activate/deactivate a user
// @access  Private (Admin)
router.put('/users/:id/toggle-active', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/drivers/analysis
// @desc    Get driver analysis stats (grouped by city/district/state) and optionally filter list of drivers
// @access  Private (Admin)
router.get('/drivers/analysis', async (req, res, next) => {
  try {
    const { state, city, district } = req.query;

    const filter = {};
    if (state) filter['address.state'] = { $regex: state, $options: 'i' };
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (district) filter['address.district'] = { $regex: district, $options: 'i' };

    const drivers = await Driver.find(filter)
      .populate('userId', 'name email phone isActive')
      .sort({ createdAt: -1 });

    const aggregation = await Driver.aggregate([
      {
        $group: {
          _id: {
            state: '$address.state',
            district: '$address.district',
            city: '$address.city'
          },
          totalRegistered: { $sum: 1 },
          totalOnline: {
            $sum: { $cond: [{ $eq: ['$isOnline', true] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          state: '$_id.state',
          district: '$_id.district',
          city: '$_id.city',
          totalRegistered: 1,
          totalOnline: 1
        }
      },
      {
        $sort: { state: 1, district: 1, city: 1 }
      }
    ]);

    const states = await Driver.distinct('address.state');
    const cities = await Driver.distinct('address.city');
    const districts = await Driver.distinct('address.district');

    res.json({
      success: true,
      data: {
        drivers,
        analysis: aggregation,
        filters: {
          states,
          cities,
          districts
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/drivers
// @desc    List all drivers with KYC status
// @access  Private (Admin)
router.get('/drivers', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const kycStatus = req.query.kycStatus;
    const skip = (page - 1) * limit;

    const filter = {};
    if (kycStatus) {
      filter['kyc.status'] = kycStatus;
    }

    const drivers = await Driver.find(filter)
      .populate('userId', 'name email phone avatar isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Driver.countDocuments(filter);

    res.json({
      success: true,
      data: { drivers, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/drivers/:id/kyc
// @desc    Approve or reject driver KYC
// @access  Private (Admin)
router.put('/drivers/:id/kyc', async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected',
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        'kyc.status': status,
        'kyc.rejectionReason': status === 'rejected' ? rejectionReason : '',
        'kyc.reviewedAt': new Date(),
        'kyc.reviewedBy': req.user._id,
      },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    logger.info(`Driver ${driver._id} KYC ${status} by admin ${req.user._id}`);

    res.json({
      success: true,
      data: { driver },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/rides
// @desc    List all rides with filters
// @access  Private (Admin)
router.get('/rides', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const rides = await Ride.find(filter)
      .populate('userId', 'name email phone')
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name phone' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ride.countDocuments(filter);

    res.json({
      success: true,
      data: { rides, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/rides/live
// @desc    Get all active rides
// @access  Private (Admin)
router.get('/rides/live', async (req, res, next) => {
  try {
    const activeStatuses = ['requested', 'accepted', 'arriving', 'arrived', 'started'];
    const rides = await Ride.find({ status: { $in: activeStatuses } })
      .populate('userId', 'name phone')
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name phone' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { rides },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/surge
// @desc    Set surge pricing
// @access  Private (Admin)
router.put('/surge', async (req, res, next) => {
  try {
    const { enabled, multiplier } = req.body;
    const config = PricingService.setSurge(
      enabled !== undefined ? enabled : false,
      multiplier || 1.0
    );

    res.json({
      success: true,
      data: { surgeConfig: config },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/reports
// @desc    Get reports & analytics
// @access  Private (Admin)
router.get('/reports', async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Rides by day
    const ridesByDay = await Ride.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Rides by vehicle type
    const ridesByType = await Ride.aggregate([
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top drivers
    const topDrivers = await Driver.find()
      .populate('userId', 'name')
      .sort({ 'earnings.total': -1 })
      .limit(10);

    res.json({
      success: true,
      data: { ridesByDay, ridesByType, topDrivers },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/coupons
// @desc    Create a coupon
// @access  Private (Admin)
router.post('/coupons', async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    logger.info(`Coupon created: ${coupon.code}`);

    res.status(201).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/coupons
// @desc    List all coupons
// @access  Private (Admin)
router.get('/coupons', async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/coupons/:id
// @desc    Update a coupon
// @access  Private (Admin)
router.put('/coupons/:id', async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, data: { coupon } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
