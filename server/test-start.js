/**
 * HaloCab Test Runner
 * Starts an in-memory MongoDB, seeds data, and launches the server
 */
const { MongoMemoryServer } = require('mongodb-memory-server');

async function startTestServer() {
  console.log('🚀 Starting HaloCab in test mode...\n');
  
  // Start in-memory MongoDB
  console.log('📦 Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017 }
  });
  const uri = mongod.getUri();
  console.log(`✅ MongoDB running at: ${uri}\n`);
  
  // Set the URI in env
  process.env.MONGODB_URI = uri;
  process.env.PORT = '5000';
  process.env.NODE_ENV = 'development';
  process.env.JWT_SECRET = 'halocab_test_secret';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.STRIPE_SECRET_KEY = 'sk_test_simulated';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_simulated';
  process.env.CLIENT_URL = 'http://localhost:5173';
  process.env.BASE_FARE_CAB = '50';
  process.env.BASE_FARE_BIKE = '20';
  process.env.PER_KM_CAB = '12';
  process.env.PER_KM_BIKE = '7';
  process.env.PER_MIN_CAB = '2';
  process.env.PER_MIN_BIKE = '1';

  // Connect and seed
  const mongoose = require('mongoose');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');
  
  // Run seeder
  console.log('🌱 Seeding database...');
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');
  const Driver = require('./models/Driver');
  const Ride = require('./models/Ride');
  const Payment = require('./models/Payment');
  const Coupon = require('./models/Coupon');
  const Rating = require('./models/Rating');

  // Create admin
  const admin = await User.create([
    {
      name: 'Admin User', email: 'admin@halocab.com',
      phone: '+919999900000', password: 'admin123',
      role: 'admin', isVerified: true,
    },
    {
      name: 'Super Admin', email: 'superadmin@halocab.com',
      phone: '+919999911111', password: 'password123',
      role: 'admin', isVerified: true,
    }
  ]);

  // Users
  const users = await User.create([
    {
      name: 'Rahul Sharma', email: 'rahul@test.com',
      phone: '+919876543210', password: 'password123',
      role: 'user', isVerified: true,
      wallet: { balance: 500 },
      savedAddresses: [
        { title: 'Home', address: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
        { title: 'Office', address: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500 },
      ],
    },
    {
      name: 'Priya Patel', email: 'priya@test.com',
      phone: '+919876543211', password: 'password123',
      role: 'user', isVerified: true, wallet: { balance: 1000 },
    },
    {
      name: 'Anjali Sharma', email: 'anjali@test.com',
      phone: '+919876543213', password: 'password123',
      role: 'user', isVerified: true, wallet: { balance: 350 },
    },
    {
      name: 'Vikram Rider', email: 'vikram_rider@test.com',
      phone: '+919876543214', password: 'password123',
      role: 'user', isVerified: true, wallet: { balance: 150 },
    },
  ]);

  // Drivers
  const driverUsers = await User.create([
    {
      name: 'Suresh Driver', email: 'suresh@driver.com',
      phone: '+919876543220', password: 'password123',
      role: 'driver', isVerified: true,
    },
    {
      name: 'Vikram Cab', email: 'vikram@driver.com',
      phone: '+919876543221', password: 'password123',
      role: 'driver', isVerified: true,
    },
    {
      name: 'Raju Bike', email: 'raju@driver.com',
      phone: '+919876543222', password: 'password123',
      role: 'driver', isVerified: true,
    },
    {
      name: 'Manish Driver', email: 'manish@driver.com',
      phone: '+919876543223', password: 'password123',
      role: 'driver', isVerified: true,
    },
    {
      name: 'Ramesh Driver', email: 'ramesh@driver.com',
      phone: '+919876543224', password: 'password123',
      role: 'driver', isVerified: true,
    },
    {
      name: 'Rajesh Driver', email: 'rajesh@driver.com',
      phone: '+919876543225', password: 'password123',
      role: 'driver', isVerified: true, isActive: false,
    },
  ]);

  const drivers = await Driver.create([
    {
      userId: driverUsers[0]._id, vehicleType: 'cab',
      vehicle: { make: 'Maruti', model: 'Swift Dzire', year: 2023, color: 'White', plateNumber: 'KA01AB1234' },
      address: { city: 'Delhi', district: 'New Delhi', state: 'Delhi' },
      kyc: { drivingLicense: 'DL-123', registrationCert: 'RC-123', insurance: 'INS-123', status: 'approved', reviewedAt: new Date() },
      isOnline: true, isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [77.2090, 28.6139] },
      rating: { average: 4.5, count: 120 },
      earnings: { today: 1500, week: 8500, month: 35000, total: 450000 },
      totalRides: 1200,
    },
    {
      userId: driverUsers[1]._id, vehicleType: 'cab',
      vehicle: { make: 'Hyundai', model: 'i20', year: 2024, color: 'Silver', plateNumber: 'KA01CD5678' },
      address: { city: 'Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh' },
      kyc: { drivingLicense: 'DL-456', registrationCert: 'RC-456', insurance: 'INS-456', status: 'approved', reviewedAt: new Date() },
      isOnline: true, isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [77.3910, 28.5355] },
      rating: { average: 4.8, count: 85 },
      earnings: { today: 2200, week: 12000, month: 42000, total: 520000 },
      totalRides: 950,
    },
    {
      userId: driverUsers[2]._id, vehicleType: 'bike',
      vehicle: { make: 'Honda', model: 'Activa 6G', year: 2024, color: 'Black', plateNumber: 'KA01EF9012' },
      address: { city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra' },
      kyc: { drivingLicense: 'DL-555', registrationCert: 'RC-555', insurance: 'INS-555', status: 'pending' },
      isOnline: false, isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [72.8777, 19.0760] },
      rating: { average: 4.2, count: 45 },
      totalRides: 200,
    },
    {
      userId: driverUsers[3]._id, vehicleType: 'cab',
      vehicle: { make: 'Tata', model: 'Tigor EV', year: 2023, color: 'Blue', plateNumber: 'KA01GH3456' },
      address: { city: 'Pune', district: 'Pune District', state: 'Maharashtra' },
      kyc: { drivingLicense: 'DL-345', registrationCert: 'RC-345', insurance: 'INS-345', status: 'approved', reviewedAt: new Date() },
      isOnline: true, isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [73.8567, 18.5204] },
      rating: { average: 4.6, count: 60 },
      totalRides: 300,
    },
    {
      userId: driverUsers[4]._id, vehicleType: 'cab',
      vehicle: { make: 'Toyota', model: 'Etios', year: 2022, color: 'White', plateNumber: 'KA01IJ7890' },
      address: { city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka' },
      kyc: { drivingLicense: 'DL-789', registrationCert: 'RC-789', insurance: 'INS-789', status: 'rejected', rejectionReason: 'Driving license expired', reviewedAt: new Date() },
      isOnline: false, isAvailable: false,
      currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
      rating: { average: 3.8, count: 20 },
      totalRides: 50,
    },
    {
      userId: driverUsers[5]._id, vehicleType: 'bike',
      vehicle: { make: 'TVS', model: 'Apache RTR', year: 2023, color: 'Red', plateNumber: 'KA01KL1234' },
      address: { city: 'Chennai', district: 'Chennai District', state: 'Tamil Nadu' },
      kyc: { drivingLicense: 'DL-1234', registrationCert: 'RC-1234', insurance: 'INS-1234', status: 'approved', reviewedAt: new Date() },
      isOnline: false, isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [80.2707, 13.0827] },
      rating: { average: 4.7, count: 90 },
      totalRides: 400,
    },
  ]);

  // Rides
  const rides = await Ride.create([
    {
      userId: users[0]._id, driverId: drivers[0]._id, vehicleType: 'cab',
      pickup: { address: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
      drop: { address: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500 },
      distance: 18.5, duration: 45,
      fare: { baseFare: 50, distanceFare: 222, timeFare: 90, surgeFare: 0, surgeMultiplier: 1, discount: 0, total: 362 },
      status: 'completed', paymentMethod: 'cash', paymentStatus: 'completed',
      startedAt: new Date(Date.now() - 3600000), completedAt: new Date(Date.now() - 900000),
    },
    {
      userId: users[1]._id, driverId: drivers[1]._id, vehicleType: 'cab',
      pickup: { address: 'MG Road, Bangalore', lat: 12.9756, lng: 77.6048 },
      drop: { address: 'Electronic City, Bangalore', lat: 12.8440, lng: 77.6630 },
      distance: 22.3, duration: 55,
      fare: { baseFare: 50, distanceFare: 268, timeFare: 110, surgeFare: 64, surgeMultiplier: 1.15, discount: 0, total: 492 },
      status: 'completed', paymentMethod: 'card', paymentStatus: 'completed',
      startedAt: new Date(Date.now() - 7200000), completedAt: new Date(Date.now() - 3600000),
    },
  ]);

  // Payments
  await Payment.create([
    { rideId: rides[0]._id, userId: users[0]._id, amount: 362, method: 'cash', status: 'succeeded' },
    { rideId: rides[1]._id, userId: users[1]._id, amount: 492, method: 'card', stripePaymentIntentId: 'pi_sim_1', status: 'succeeded' },
  ]);

  // Coupons
  await Coupon.create([
    {
      code: 'WELCOME50', description: 'Welcome offer - 50% off',
      discountType: 'percentage', discountValue: 50,
      minRideAmount: 100, maxDiscount: 200,
      validFrom: new Date(), validTo: new Date(Date.now() + 90 * 86400000),
      usageLimit: 1000, isActive: true,
    },
    {
      code: 'FLAT100', description: 'Flat ₹100 off on rides above ₹300',
      discountType: 'flat', discountValue: 100,
      minRideAmount: 300, maxDiscount: 100,
      validFrom: new Date(), validTo: new Date(Date.now() + 30 * 86400000),
      usageLimit: 500, isActive: true,
    },
  ]);

  console.log('✅ Database seeded!\n');
  console.log('📧 Test Accounts:');
  console.log('  Admin:  admin@halocab.com / admin123');
  console.log('  User:   rahul@test.com / password123');
  console.log('  Driver: suresh@driver.com / password123 (KYC approved, cab, active)');
  console.log('  Driver: vikram@driver.com / password123 (KYC approved, cab, active)');
  console.log('  Driver: raju@driver.com / password123 (KYC pending, bike, inactive)');
  console.log('  Driver: manish@driver.com / password123 (KYC approved, cab, offline)');
  console.log('  Driver: ramesh@driver.com / password123 (KYC rejected, cab, inactive)');
  console.log('  Driver: rajesh@driver.com / password123 (KYC approved, bike, user deactivated)');
  console.log('');

  // Close this connection since server.js will create its own
  await mongoose.disconnect();

  // Start the server
  require('./server');
  
  // Cleanup on exit
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await mongod.stop();
    process.exit(0);
  });
}

startTestServer().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
