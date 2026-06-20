const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const User = require('../models/User');
const logger = require('../utils/logger');

class PaymentService {
  /**
   * Create a payment intent (simulated Stripe)
   */
  static async createPaymentIntent(rideId, userId) {
    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error('Ride not found');
    if (ride.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    // Simulated Stripe payment intent
    const paymentIntentId = `pi_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = await Payment.create({
      rideId,
      userId,
      amount: ride.fare.total,
      currency: 'inr',
      method: ride.paymentMethod,
      stripePaymentIntentId: paymentIntentId,
      status: 'pending',
    });

    logger.info(`Payment intent created: ${paymentIntentId} for ride ${rideId}`);

    return {
      paymentId: payment._id,
      clientSecret: `${paymentIntentId}_secret_simulated`,
      amount: ride.fare.total,
    };
  }

  /**
   * Confirm payment (simulated)
   */
  static async confirmPayment(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Payment not found');

    payment.status = 'succeeded';
    await payment.save();

    // Update ride payment status
    await Ride.findByIdAndUpdate(payment.rideId, {
      paymentStatus: 'completed',
    });

    logger.info(`Payment confirmed: ${payment._id}`);
    return payment;
  }

  /**
   * Process cash payment
   */
  static async processCashPayment(rideId, userId) {
    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error('Ride not found');

    const payment = await Payment.create({
      rideId,
      userId,
      amount: ride.fare.total,
      currency: 'inr',
      method: 'cash',
      status: 'succeeded',
    });

    ride.paymentStatus = 'completed';
    await ride.save();

    logger.info(`Cash payment processed for ride ${rideId}`);
    return payment;
  }

  /**
   * Process wallet payment
   */
  static async processWalletPayment(rideId, userId) {
    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error('Ride not found');

    const user = await User.findById(userId);
    if (user.wallet.balance < ride.fare.total) {
      throw new Error('Insufficient wallet balance');
    }

    // Deduct from wallet
    user.wallet.balance -= ride.fare.total;
    await user.save();

    const payment = await Payment.create({
      rideId,
      userId,
      amount: ride.fare.total,
      currency: 'inr',
      method: 'wallet',
      status: 'succeeded',
    });

    ride.paymentStatus = 'completed';
    await ride.save();

    logger.info(`Wallet payment processed for ride ${rideId}. New balance: ${user.wallet.balance}`);
    return payment;
  }

  /**
   * Process refund
   */
  static async processRefund(paymentId, reason) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'succeeded') {
      throw new Error('Can only refund succeeded payments');
    }

    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = reason;
    await payment.save();

    // Update ride
    await Ride.findByIdAndUpdate(payment.rideId, {
      paymentStatus: 'refunded',
    });

    // If wallet payment, restore balance
    if (payment.method === 'wallet') {
      await User.findByIdAndUpdate(payment.userId, {
        $inc: { 'wallet.balance': payment.amount },
      });
    }

    logger.info(`Refund processed: ${payment._id}, amount: ${payment.amount}`);
    return payment;
  }

  /**
   * Get payment history for a user
   */
  static async getUserPayments(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const payments = await Payment.find({ userId })
      .populate('rideId', 'pickup drop fare status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ userId });
    return { payments, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = PaymentService;
