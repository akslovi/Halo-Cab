const { body, param, query, validationResult } = require('express-validator');

// Handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^\+?[\d\s-]{10,15}$/).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'driver']).withMessage('Role must be user or driver'),
  validate,
];

const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Ride validators
const estimateValidator = [
  body('pickup.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid pickup latitude required'),
  body('pickup.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid pickup longitude required'),
  body('pickup.address').trim().notEmpty().withMessage('Pickup address is required'),
  body('drop.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid drop latitude required'),
  body('drop.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid drop longitude required'),
  body('drop.address').trim().notEmpty().withMessage('Drop address is required'),
  body('vehicleType').isIn(['cab', 'bike']).withMessage('Vehicle type must be cab or bike'),
  validate,
];

const bookRideValidator = [
  ...estimateValidator.slice(0, -1), // all validations except the validate middleware
  body('paymentMethod').isIn(['card', 'upi', 'wallet', 'cash']).withMessage('Valid payment method required'),
  body('couponCode').optional().trim(),
  validate,
];

// Driver validators
const kycValidator = [
  body('vehicleType').isIn(['cab', 'bike']).withMessage('Vehicle type must be cab or bike'),
  body('vehicle.make').trim().notEmpty().withMessage('Vehicle make is required'),
  body('vehicle.model').trim().notEmpty().withMessage('Vehicle model is required'),
  body('vehicle.year').isInt({ min: 2000, max: 2030 }).withMessage('Valid vehicle year required'),
  body('vehicle.color').trim().notEmpty().withMessage('Vehicle color is required'),
  body('vehicle.plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('kyc.drivingLicense').trim().notEmpty().withMessage('Driving license number is required'),
  body('kyc.registrationCert').trim().notEmpty().withMessage('Registration certificate is required'),
  validate,
];

const locationValidator = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  validate,
];

const rideIdValidator = [
  param('id').isMongoId().withMessage('Valid ride ID required'),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  estimateValidator,
  bookRideValidator,
  kycValidator,
  locationValidator,
  rideIdValidator,
};
