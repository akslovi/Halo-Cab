const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const PricingService = require('./pricingService');
const { RIDE_STATUS, RIDE_TRANSITIONS } = require('../utils/constants');
const logger = require('../utils/logger');

class RideService {
  /**
   * Get fare estimate for a ride
   */
  static async getEstimate(pickup, drop, vehicleType, couponCode) {
    const distance = PricingService.calculateDistance(
      pickup.lat, pickup.lng, drop.lat, drop.lng
    );
    const duration = PricingService.estimateDuration(distance, vehicleType);

    let couponDiscount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const subtotal = PricingService.calculateFare(distance, duration, vehicleType).total;
        const validation = coupon.isValid(subtotal);
        if (validation.valid) {
          couponDiscount = coupon.calculateDiscount(subtotal);
          couponApplied = coupon.code;
        }
      }
    }

    const fare = PricingService.calculateFare(distance, duration, vehicleType, couponDiscount);

    // Count nearby available drivers
    const nearbyDrivers = await this.findNearbyDrivers(
      pickup.lng, pickup.lat, vehicleType, 5000
    );

    return {
      distance,
      duration,
      fare,
      couponApplied,
      couponDiscount,
      nearbyDriverCount: nearbyDrivers.length,
      estimatedPickupTime: nearbyDrivers.length > 0 ? 5 : null, // minutes
    };
  }

  /**
   * Book a ride
   */
  static async bookRide(userId, rideData) {
    const { pickup, drop, vehicleType, paymentMethod, couponCode, scheduledAt } = rideData;

    // Calculate fare
    const estimate = await this.getEstimate(pickup, drop, vehicleType, couponCode);

    // Apply coupon
    let couponApplied = '';
    if (couponCode && estimate.couponApplied) {
      couponApplied = estimate.couponApplied;
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // Create ride
    const ride = await Ride.create({
      userId,
      vehicleType,
      pickup,
      drop,
      distance: estimate.distance,
      duration: estimate.duration,
      fare: {
        ...estimate.fare,
        couponCode: couponApplied,
      },
      paymentMethod,
      scheduledAt: scheduledAt || null,
      status: RIDE_STATUS.REQUESTED,
    });

    logger.info(`Ride booked: ${ride._id} by user ${userId}`);
    return ride;
  }

  /**
   * Find nearby available drivers using geospatial query
   */
  static async findNearbyDrivers(lng, lat, vehicleType, maxDistanceMeters = 5000) {
    const drivers = await Driver.find({
      isOnline: true,
      isAvailable: true,
      vehicleType,
      'kyc.status': 'approved',
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    })
      .populate('userId', 'name phone avatar')
      .limit(10);

    return drivers;
  }

  /**
   * Driver accepts a ride
   */
  static async acceptRide(rideId, driverId) {
    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error('Ride not found');
    if (ride.status !== RIDE_STATUS.REQUESTED) {
      throw new Error('Ride is no longer available');
    }

    ride.driverId = driverId;
    ride.status = RIDE_STATUS.ACCEPTED;
    await ride.save();

    // Mark driver as unavailable
    await Driver.findByIdAndUpdate(driverId, { isAvailable: false });

    logger.info(`Ride ${rideId} accepted by driver ${driverId}`);
    return ride;
  }

  /**
   * Update ride status with transition validation
   */
  static async updateRideStatus(rideId, newStatus, extras = {}) {
    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error('Ride not found');

    const allowedTransitions = RIDE_TRANSITIONS[ride.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(`Cannot transition from ${ride.status} to ${newStatus}`);
    }

    ride.status = newStatus;

    if (newStatus === RIDE_STATUS.STARTED) {
      ride.startedAt = new Date();
    } else if (newStatus === RIDE_STATUS.COMPLETED) {
      ride.completedAt = new Date();
      // Make driver available again
      if (ride.driverId) {
        await Driver.findByIdAndUpdate(ride.driverId, { isAvailable: true });
        // Update driver earnings
        await Driver.findByIdAndUpdate(ride.driverId, {
          $inc: {
            'earnings.today': ride.fare.total,
            'earnings.week': ride.fare.total,
            'earnings.month': ride.fare.total,
            'earnings.total': ride.fare.total,
            totalRides: 1,
          },
        });
      }
    } else if (newStatus === RIDE_STATUS.CANCELLED) {
      ride.cancelledAt = new Date();
      ride.cancelReason = extras.cancelReason || '';
      ride.cancelledBy = extras.cancelledBy || 'system';
      // Make driver available again
      if (ride.driverId) {
        await Driver.findByIdAndUpdate(ride.driverId, { isAvailable: true });
      }
    }

    await ride.save();
    logger.info(`Ride ${rideId} status updated to ${newStatus}`);
    return ride;
  }

  /**
   * Get ride history for a user
   */
  static async getUserRideHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const rides = await Ride.find({ userId })
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name phone avatar' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ride.countDocuments({ userId });
    return { rides, total, page, pages: Math.ceil(total / limit) };
  }

  /**
   * Get ride history for a driver
   */
  static async getDriverRideHistory(driverId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const rides = await Ride.find({ driverId })
      .populate('userId', 'name phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ride.countDocuments({ driverId });
    return { rides, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = RideService;
