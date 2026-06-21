const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['cab', 'bike'],
      required: [true, 'Vehicle type is required'],
    },
    vehicle: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      color: { type: String, required: true },
      plateNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
      },
    },
    kyc: {
      drivingLicense: { type: String, default: '' },
      registrationCert: { type: String, default: '' },
      insurance: { type: String, default: '' },
      profilePhoto: { type: String, default: '' },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      rejectionReason: { type: String, default: '' },
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    rating: {
      average: { type: Number, default: 5.0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    earnings: {
      today: { type: Number, default: 0 },
      week: { type: Number, default: 0 },
      month: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    lastOnlineAt: Date,
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial queries (find nearby drivers)
driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ isOnline: 1, isAvailable: 1, vehicleType: 1 });

module.exports = mongoose.model('Driver', driverSchema);
