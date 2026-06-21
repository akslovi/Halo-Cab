const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../middleware/validators');
const logger = require('../utils/logger');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidator, async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone',
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'user',
    });

    const token = generateToken(user._id);

    logger.info(`User registered: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Contact support.',
      });
    }

    const token = generateToken(user._id);

    // If user is a driver, include driver profile
    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await Driver.findOne({ userId: user._id });
    }

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      data: {
        user,
        token,
        driverProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', async (req, res, next) => {
  try {
    const { phone } = req.body;
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create a temporary user with basic info if they don't exist
      user = new User({
        name: 'New Rider', // Default placeholder
        email: `rider_${Date.now()}@halocab.com`, // Dummy email to satisfy unique constraint
        phone: phone,
        password: `Tmp_${Date.now()}_${Math.random()}`, // Random secure password
        role: 'user',
        isVerified: false,
      });
    }

    // Generate OTP (simulated - in production use Twilio/SMS service)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };
    await user.save();

    logger.info(`OTP sent to ${phone}: ${otp} (simulated)`);

    // Send OTP via WhatsApp message using sender 7905426920
    await whatsappService.sendOTP(phone, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Include OTP in response for development/testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login
// @access  Public
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: 'No OTP was sent. Request a new one.',
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Clear OTP and verify user
    user.otp = undefined;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    // If user is a driver, include driver profile
    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await Driver.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: { user, token, driverProfile },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await Driver.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: { user, driverProfile },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, avatar, savedAddresses } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;
    if (savedAddresses) updates.savedAddresses = savedAddresses;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
