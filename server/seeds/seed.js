const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const Rating = require('../models/Rating');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Driver.deleteMany({}),
      Ride.deleteMany({}),
      Payment.deleteMany({}),
      Coupon.deleteMany({}),
      Rating.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create admin
    await User.create([
      {
        name: 'Admin User',
        email: 'admin@halocab.com',
        phone: '+919999900000',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
      },
      {
        name: 'Super Admin',
        email: 'superadmin@halocab.com',
        phone: '+919999911111',
        password: 'password123',
        role: 'admin',
        isVerified: true,
      }
    ]);

    // Create test users (riders)
    const users = await User.create([
      {
        name: 'Rahul Sharma',
        email: 'rahul@test.com',
        phone: '+919876543210',
        password: 'password123',
        role: 'user',
        isVerified: true,
        wallet: { balance: 500 },
        savedAddresses: [
          { title: 'Home', address: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
          { title: 'Office', address: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500 },
        ],
      },
      {
        name: 'Priya Patel',
        email: 'priya@test.com',
        phone: '+919876543211',
        password: 'password123',
        role: 'user',
        isVerified: true,
        wallet: { balance: 1000 },
      },
      {
        name: 'Amit Kumar',
        email: 'amit@test.com',
        phone: '+919876543212',
        password: 'password123',
        role: 'user',
        isVerified: true,
        wallet: { balance: 250 },
      },
      {
        name: 'Anjali Sharma',
        email: 'anjali@test.com',
        phone: '+919876543213',
        password: 'password123',
        role: 'user',
        isVerified: true,
        wallet: { balance: 350 },
      },
      {
        name: 'Vikram Rider',
        email: 'vikram_rider@test.com',
        phone: '+919876543214',
        password: 'password123',
        role: 'user',
        isVerified: true,
        wallet: { balance: 150 },
      },
    ]);

    // Create driver users
    const driverUsers = await User.create([
      {
        name: 'Suresh Driver',
        email: 'suresh@driver.com',
        phone: '+919876543220',
        password: 'password123',
        role: 'driver',
        isVerified: true,
      },
      {
        name: 'Vikram Cab',
        email: 'vikram@driver.com',
        phone: '+919876543221',
        password: 'password123',
        role: 'driver',
        isVerified: true,
      },
      {
        name: 'Raju Bike',
        email: 'raju@driver.com',
        phone: '+919876543222',
        password: 'password123',
        role: 'driver',
        isVerified: true,
      },
      {
        name: 'Manish Driver',
        email: 'manish@driver.com',
        phone: '+919876543223',
        password: 'password123',
        role: 'driver',
        isVerified: true,
      },
      {
        name: 'Ramesh Driver',
        email: 'ramesh@driver.com',
        phone: '+919876543224',
        password: 'password123',
        role: 'driver',
        isVerified: true,
      },
      {
        name: 'Rajesh Driver',
        email: 'rajesh@driver.com',
        phone: '+919876543225',
        password: 'password123',
        role: 'driver',
        isVerified: true,
        isActive: false,
      },
    ]);

    // Create driver profiles
    const drivers = await Driver.create([
      {
        userId: driverUsers[0]._id,
        vehicleType: 'cab',
        vehicle: {
          make: 'Maruti',
          model: 'Swift Dzire',
          year: 2023,
          color: 'White',
          plateNumber: 'KA01AB1234',
        },
        address: {
          city: 'Delhi',
          district: 'New Delhi',
          state: 'Delhi',
        },
        kyc: {
          drivingLicense: 'DL-1234567890',
          registrationCert: 'RC-1234567890',
          insurance: 'INS-1234567890',
          status: 'approved',
          reviewedAt: new Date(),
        },
        isOnline: true,
        isAvailable: true,
        currentLocation: {
          type: 'Point',
          coordinates: [77.2090, 28.6139], // Delhi
        },
        rating: { average: 4.5, count: 120 },
        earnings: { today: 1500, week: 8500, month: 35000, total: 450000 },
        totalRides: 1200,
      },
      {
        userId: driverUsers[1]._id,
        vehicleType: 'cab',
        vehicle: {
          make: 'Hyundai',
          model: 'i20',
          year: 2024,
          color: 'Silver',
          plateNumber: 'KA01CD5678',
        },
        address: {
          city: 'Noida',
          district: 'Gautam Buddha Nagar',
          state: 'Uttar Pradesh',
        },
        kyc: {
          drivingLicense: 'DL-9876543210',
          registrationCert: 'RC-9876543210',
          insurance: 'INS-9876543210',
          status: 'approved',
          reviewedAt: new Date(),
        },
        isOnline: true,
        isAvailable: true,
        currentLocation: {
          type: 'Point',
          coordinates: [77.3910, 28.5355], // Noida
        },
        rating: { average: 4.8, count: 85 },
        earnings: { today: 2200, week: 12000, month: 42000, total: 520000 },
        totalRides: 950,
      },
      {
        userId: driverUsers[2]._id,
        vehicleType: 'bike',
        vehicle: {
          make: 'Honda',
          model: 'Activa 6G',
          year: 2024,
          color: 'Black',
          plateNumber: 'KA01EF9012',
        },
        address: {
          city: 'Mumbai',
          district: 'Mumbai Suburban',
          state: 'Maharashtra',
        },
        kyc: {
          drivingLicense: 'DL-5555666677',
          registrationCert: 'RC-5555666677',
          status: 'pending',
        },
        isOnline: false,
        isAvailable: true,
        currentLocation: {
          type: 'Point',
          coordinates: [72.8777, 19.0760], // Mumbai
        },
        rating: { average: 4.2, count: 45 },
        totalRides: 200,
      },
      {
        userId: driverUsers[3]._id,
        vehicleType: 'cab',
        vehicle: {
          make: 'Tata',
          model: 'Tigor EV',
          year: 2023,
          color: 'Blue',
          plateNumber: 'KA01GH3456',
        },
        address: {
          city: 'Pune',
          district: 'Pune District',
          state: 'Maharashtra',
        },
        kyc: {
          drivingLicense: 'DL-3456789012',
          registrationCert: 'RC-3456789012',
          status: 'approved',
          reviewedAt: new Date(),
        },
        isOnline: true,
        isAvailable: true,
        currentLocation: {
          type: 'Point',
          coordinates: [73.8567, 18.5204], // Pune
        },
        rating: { average: 4.6, count: 60 },
        totalRides: 300,
      },
      {
        userId: driverUsers[4]._id,
        vehicleType: 'cab',
        vehicle: {
          make: 'Toyota',
          model: 'Etios',
          year: 2022,
          color: 'White',
          plateNumber: 'KA01IJ7890',
        },
        address: {
          city: 'Bangalore',
          district: 'Bangalore Urban',
          state: 'Karnataka',
        },
        kyc: {
          drivingLicense: 'DL-7890123456',
          registrationCert: 'RC-7890123456',
          status: 'rejected',
          rejectionReason: 'Driving license expired',
          reviewedAt: new Date(),
        },
        isOnline: false,
        isAvailable: false,
        currentLocation: {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bangalore
        },
        rating: { average: 3.8, count: 20 },
        totalRides: 50,
      },
      {
        userId: driverUsers[5]._id,
        vehicleType: 'bike',
        vehicle: {
          make: 'TVS',
          model: 'Apache RTR',
          year: 2023,
          color: 'Red',
          plateNumber: 'KA01KL1234',
        },
        address: {
          city: 'Chennai',
          district: 'Chennai District',
          state: 'Tamil Nadu',
        },
        kyc: {
          drivingLicense: 'DL-1234509876',
          registrationCert: 'RC-1234509876',
          status: 'approved',
          reviewedAt: new Date(),
        },
        isOnline: false,
        isAvailable: true,
        currentLocation: {
          type: 'Point',
          coordinates: [80.2707, 13.0827], // Chennai
        },
        rating: { average: 4.7, count: 90 },
        totalRides: 400,
      },
    ]);

    // Create sample rides
    const rides = await Ride.create([
      {
        userId: users[0]._id,
        driverId: drivers[0]._id,
        vehicleType: 'cab',
        pickup: { address: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
        drop: { address: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500 },
        distance: 18.5,
        duration: 45,
        fare: { baseFare: 50, distanceFare: 222, timeFare: 90, surgeFare: 0, surgeMultiplier: 1, discount: 0, total: 362 },
        status: 'completed',
        paymentMethod: 'cash',
        paymentStatus: 'completed',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 900000),
      },
      {
        userId: users[1]._id,
        driverId: drivers[1]._id,
        vehicleType: 'cab',
        pickup: { address: 'MG Road, Bangalore', lat: 12.9756, lng: 77.6048 },
        drop: { address: 'Electronic City, Bangalore', lat: 12.8440, lng: 77.6630 },
        distance: 22.3,
        duration: 55,
        fare: { baseFare: 50, distanceFare: 268, timeFare: 110, surgeFare: 64, surgeMultiplier: 1.15, discount: 0, total: 492 },
        status: 'completed',
        paymentMethod: 'card',
        paymentStatus: 'completed',
        startedAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 3600000),
      },
    ]);

    // Create sample payments
    await Payment.create([
      {
        rideId: rides[0]._id,
        userId: users[0]._id,
        amount: 362,
        method: 'cash',
        status: 'succeeded',
      },
      {
        rideId: rides[1]._id,
        userId: users[1]._id,
        amount: 492,
        method: 'card',
        stripePaymentIntentId: 'pi_sim_sample_1',
        status: 'succeeded',
      },
    ]);

    // Create sample ratings
    await Rating.create([
      {
        rideId: rides[0]._id,
        userId: users[0]._id,
        driverId: drivers[0]._id,
        rating: 5,
        review: 'Great ride! Very safe driver.',
      },
      {
        rideId: rides[1]._id,
        userId: users[1]._id,
        driverId: drivers[1]._id,
        rating: 4,
        review: 'Good ride, slightly long route.',
      },
    ]);

    // Create coupons
    await Coupon.create([
      {
        code: 'WELCOME50',
        description: 'Welcome offer - 50% off on first ride',
        discountType: 'percentage',
        discountValue: 50,
        minRideAmount: 100,
        maxDiscount: 200,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: 'FLAT100',
        description: 'Flat ₹100 off on rides above ₹300',
        discountType: 'flat',
        discountValue: 100,
        minRideAmount: 300,
        maxDiscount: 100,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        isActive: true,
      },
    ]);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Test Accounts:');
    console.log('  Admin:  admin@halocab.com / admin123');
    console.log('  User:   rahul@test.com / password123');
    console.log('  User:   priya@test.com / password123');
    console.log('  Driver: suresh@driver.com / password123 (KYC approved, cab, active)');
    console.log('  Driver: vikram@driver.com / password123 (KYC approved, cab, active)');
    console.log('  Driver: raju@driver.com / password123 (KYC pending, bike, inactive)');
    console.log('  Driver: manish@driver.com / password123 (KYC approved, cab, offline)');
    console.log('  Driver: ramesh@driver.com / password123 (KYC rejected, cab, inactive)');
    console.log('  Driver: rajesh@driver.com / password123 (KYC approved, bike, user deactivated)');
    console.log('\n🎫 Coupon Codes: WELCOME50, FLAT100');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
