# HaloCab — Cab & Bike Ride Booking System

A production-ready, Uber/Ola-style ride booking platform with real-time tracking, dynamic pricing, and multi-role dashboards.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Maps | Leaflet + OpenStreetMap |
| Payments | Stripe (simulated) |
| Auth | JWT + bcrypt |
| Deployment | Docker + Docker Compose |

## 📋 Features

### User (Rider)
- ✅ Register/Login with JWT
- ✅ Book Cab or Bike
- ✅ Location autocomplete (OpenStreetMap)
- ✅ Fare estimation before booking
- ✅ Real-time ride tracking
- ✅ Apply coupon codes
- ✅ Multiple payment methods (Cash, Card, Wallet)
- ✅ Ride history & status tracking
- ✅ Rate driver after ride
- ✅ Cancel ride
- ✅ SOS emergency button

### Driver
- ✅ Register with KYC
- ✅ Go Online/Offline
- ✅ Accept/Reject rides with countdown timer
- ✅ Ride OTP verification
- ✅ Live location broadcasting
- ✅ Earnings dashboard with charts
- ✅ Ride history

### Admin
- ✅ Dashboard with 8 real-time stats
- ✅ Revenue charts
- ✅ User management (search, activate/deactivate)
- ✅ Driver management with KYC approval
- ✅ Live rides map
- ✅ Surge pricing control
- ✅ Coupon management

## 🛠 Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Docker)

### Quick Start

```bash
# 1. Clone and setup server
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# 2. Seed database
npm run seed

# 3. Start server
npm run dev

# 4. In a new terminal, setup client
cd client
npm install
npm run dev
```

### Docker Setup

```bash
docker-compose up --build
```

## 🔐 Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@halocab.com | admin123 |
| User | rahul@test.com | password123 |
| User | priya@test.com | password123 |
| Driver (Cab, Approved) | suresh@driver.com | password123 |
| Driver (Cab, Approved) | vikram@driver.com | password123 |
| Driver (Bike, Pending) | raju@driver.com | password123 |

**Coupon Codes:** WELCOME50, FLAT100

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Rides
- `POST /api/rides/estimate` - Fare estimate
- `POST /api/rides/book` - Book ride
- `PUT /api/rides/:id/cancel` - Cancel ride
- `GET /api/rides` - Ride history
- `POST /api/rides/:id/rate` - Rate driver

### Driver
- `POST /api/drivers/kyc` - Submit KYC
- `PUT /api/drivers/toggle-online` - Toggle status
- `PUT /api/drivers/rides/:id/accept` - Accept ride
- `PUT /api/drivers/rides/:id/start` - Start ride
- `PUT /api/drivers/rides/:id/complete` - Complete ride

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `PUT /api/admin/drivers/:id/kyc` - KYC review
- `PUT /api/admin/surge` - Set surge pricing
- `POST /api/admin/coupons` - Create coupon

## 🗄 Database Schema

```
Users → Drivers (1:1)
Users → Rides (1:N)
Drivers → Rides (1:N)
Rides → Payments (1:1)
Rides → Ratings (1:1)
```

## 🔌 Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| ride_request | Server → Driver | New ride nearby |
| accept_ride | Driver → Server | Accept ride |
| ride_accepted | Server → User | Driver found |
| update_location | Driver → Server | GPS update |
| driver_location | Server → User | Driver position |
| ride_completed | Server → User | Ride done |
| sos_trigger | User → Server | Emergency |

## 📁 Project Structure

```
haloCab/
├── server/
│   ├── config/          # Database config
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/          # Mongoose schemas (6 models)
│   ├── routes/          # Express routes (5 route files)
│   ├── services/        # Business logic
│   ├── sockets/         # Socket.IO handlers
│   ├── seeds/           # Database seed data
│   ├── utils/           # Logger, constants
│   └── server.js        # Entry point
├── client/
│   ├── src/
│   │   ├── components/  # Map, layout components
│   │   ├── contexts/    # Auth, Socket contexts
│   │   ├── pages/       # User, Driver, Admin pages
│   │   ├── services/    # API client
│   │   └── App.jsx      # Main app with routing
│   └── index.html
├── docker-compose.yml
└── README.md
```

## 📄 License

MIT
