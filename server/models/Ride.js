const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    vehicleType: {
      type: String,
      enum: ['cab', 'bike'],
      required: true,
    },
    pickup: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    drop: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    distance: {
      type: Number, // in km
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    fare: {
      baseFare: { type: Number, required: true },
      distanceFare: { type: Number, required: true },
      timeFare: { type: Number, required: true },
      surgeFare: { type: Number, default: 0 },
      surgeMultiplier: { type: Number, default: 1 },
      discount: { type: Number, default: 0 },
      couponCode: { type: String, default: '' },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'arriving', 'arrived', 'started', 'completed', 'cancelled'],
      default: 'requested',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'cash'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    otp: {
      type: String,
      default: function () {
        return Math.floor(1000 + Math.random() * 9000).toString();
      },
    },
    route: {
      encodedPolyline: String,
      waypoints: [
        {
          lat: Number,
          lng: Number,
        },
      ],
    },
    cancelReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'driver', 'system', ''],
      default: '',
    },
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    sos: {
      triggered: { type: Boolean, default: false },
      triggeredAt: Date,
      resolvedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
rideSchema.index({ userId: 1, createdAt: -1 });
rideSchema.index({ driverId: 1, createdAt: -1 });
rideSchema.index({ status: 1 });
rideSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema);
