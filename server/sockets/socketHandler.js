const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const logger = require('../utils/logger');

// In-memory driver locations (would use Redis in production)
const driverLocations = new Map();

const setupSocketHandlers = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Join user-specific room
    if (socket.user.role === 'user') {
      socket.join(`user_${userId}`);
    }

    // Join driver-specific room
    if (socket.user.role === 'driver') {
      setupDriverSocket(socket, io);
    }

    // Join admin room
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
    }

    // Handle ride tracking subscription
    socket.on('subscribe_ride', (rideId) => {
      socket.join(`ride_${rideId}`);
      logger.debug(`${socket.user.name} subscribed to ride ${rideId}`);
    });

    socket.on('unsubscribe_ride', (rideId) => {
      socket.leave(`ride_${rideId}`);
    });

    // SOS Emergency
    socket.on('sos_trigger', async (data) => {
      try {
        const { rideId } = data;
        const ride = await Ride.findById(rideId);
        if (ride) {
          ride.sos.triggered = true;
          ride.sos.triggeredAt = new Date();
          await ride.save();

          // Alert admin
          io.to('admin_room').emit('sos_alert', {
            rideId,
            userId: ride.userId,
            driverId: ride.driverId,
            location: data.location,
            timestamp: new Date(),
          });

          logger.warn(`SOS triggered for ride ${rideId}`);
        }
      } catch (error) {
        logger.error('SOS trigger error:', error);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.user.name}`);
      // Remove driver location from memory
      if (socket.user.role === 'driver') {
        driverLocations.delete(userId);
      }
    });
  });
};

const setupDriverSocket = async (socket, io) => {
  const userId = socket.user._id.toString();

  // Find driver profile
  const driver = await Driver.findOne({ userId: socket.user._id });
  if (driver) {
    socket.join(`driver_${driver._id}`);
    socket.driverId = driver._id.toString();
  }

  // Handle driver location updates
  socket.on('update_location', async (data) => {
    try {
      const { lat, lng } = data;
      if (!lat || !lng) return;

      // Store in memory for real-time tracking
      driverLocations.set(socket.driverId, {
        lat,
        lng,
        updatedAt: Date.now(),
      });

      // Update database periodically (every 10th update)
      if (!socket.locationUpdateCount) socket.locationUpdateCount = 0;
      socket.locationUpdateCount++;

      if (socket.locationUpdateCount % 10 === 0) {
        await Driver.findByIdAndUpdate(socket.driverId, {
          currentLocation: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });
      }

      // Find active rides for this driver and broadcast location
      const activeRide = await Ride.findOne({
        driverId: socket.driverId,
        status: { $in: ['accepted', 'arriving', 'arrived', 'started'] },
      });

      if (activeRide) {
        io.to(`user_${activeRide.userId}`).emit('driver_location', {
          rideId: activeRide._id,
          lat,
          lng,
          timestamp: Date.now(),
        });

        // Also broadcast to ride room (for admin tracking)
        io.to(`ride_${activeRide._id}`).emit('driver_location', {
          rideId: activeRide._id,
          lat,
          lng,
          timestamp: Date.now(),
        });
      }

      // Broadcast to admin room for live map
      io.to('admin_room').emit('driver_location_update', {
        driverId: socket.driverId,
        lat,
        lng,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Location update error:', error);
    }
  });

  // Handle ride acceptance via socket
  socket.on('accept_ride', async (data) => {
    try {
      const { rideId } = data;
      const ride = await Ride.findById(rideId);

      if (!ride || ride.status !== 'requested') {
        socket.emit('ride_error', { message: 'Ride is no longer available' });
        return;
      }

      ride.driverId = socket.driverId;
      ride.status = 'accepted';
      await ride.save();

      await Driver.findByIdAndUpdate(socket.driverId, { isAvailable: false });

      const populatedRide = await Ride.findById(rideId)
        .populate('userId', 'name phone avatar');

      // Notify user
      io.to(`user_${ride.userId}`).emit('ride_accepted', {
        ride: populatedRide,
        driver: {
          id: socket.driverId,
          name: socket.user.name,
          phone: socket.user.phone,
          location: driverLocations.get(socket.driverId),
        },
      });

      // Confirm to driver
      socket.emit('ride_confirmed', { ride: populatedRide });

      logger.info(`Ride ${rideId} accepted by driver ${socket.driverId} via socket`);
    } catch (error) {
      logger.error('Accept ride error:', error);
      socket.emit('ride_error', { message: error.message });
    }
  });
};

// Utility to get all driver locations
const getDriverLocations = () => {
  return Object.fromEntries(driverLocations);
};

module.exports = { setupSocketHandlers, getDriverLocations };
