const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minRideAmount: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: 500,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ isActive: 1, validTo: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function (rideAmount) {
  const now = new Date();
  if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
  if (now < this.validFrom) return { valid: false, reason: 'Coupon not yet valid' };
  if (now > this.validTo) return { valid: false, reason: 'Coupon has expired' };
  if (this.usedCount >= this.usageLimit) return { valid: false, reason: 'Coupon usage limit reached' };
  if (rideAmount < this.minRideAmount) return { valid: false, reason: `Minimum ride amount is ₹${this.minRideAmount}` };
  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (amount) {
  let discount;
  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, this.maxDiscount);
};

module.exports = mongoose.model('Coupon', couponSchema);
