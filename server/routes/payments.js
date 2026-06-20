const express = require('express');
const PaymentService = require('../services/paymentService');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.use(protect);
router.use(authorize('user', 'admin'));

// @route   POST /api/payments/create-intent
// @desc    Create payment intent for a ride
// @access  Private (User)
router.post('/create-intent', async (req, res, next) => {
  try {
    const { rideId } = req.body;
    const result = await PaymentService.createPaymentIntent(rideId, req.user._id);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm a payment
// @access  Private (User)
router.post('/confirm', async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const payment = await PaymentService.confirmPayment(paymentId);

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/cash
// @desc    Process cash payment
// @access  Private (User)
router.post('/cash', async (req, res, next) => {
  try {
    const { rideId } = req.body;
    const payment = await PaymentService.processCashPayment(rideId, req.user._id);

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/wallet
// @desc    Process wallet payment
// @access  Private (User)
router.post('/wallet', async (req, res, next) => {
  try {
    const { rideId } = req.body;
    const payment = await PaymentService.processWalletPayment(rideId, req.user._id);

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund
// @access  Private (Admin)
router.post('/refund', authorize('admin'), async (req, res, next) => {
  try {
    const { paymentId, reason } = req.body;
    const payment = await PaymentService.processRefund(paymentId, reason);

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payments/history
// @desc    Get payment history
// @access  Private (User)
router.get('/history', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await PaymentService.getUserPayments(req.user._id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler (simulated)
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  logger.info('Webhook received (simulated)');
  res.json({ received: true });
});

module.exports = router;
