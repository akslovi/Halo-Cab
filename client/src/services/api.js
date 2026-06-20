import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('halocab_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear token - let React's AuthContext and route guards handle the redirect
      // Avoid window.location.href which causes full page reloads and race conditions
      localStorage.removeItem('halocab_token');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
};

// Ride API
export const rideAPI = {
  getEstimate: (data) => api.post('/rides/estimate', data),
  bookRide: (data) => api.post('/rides/book', data),
  scheduleRide: (data) => api.post('/rides/schedule', data),
  cancelRide: (id, reason) => api.put(`/rides/${id}/cancel`, { reason }),
  getRide: (id) => api.get(`/rides/${id}`),
  getRideHistory: (page = 1) => api.get(`/rides?page=${page}`),
  rateRide: (id, rating, review) => api.post(`/rides/${id}/rate`, { rating, review }),
};

// Driver API
export const driverAPI = {
  submitKYC: (data) => api.post('/drivers/kyc', data),
  toggleOnline: () => api.put('/drivers/toggle-online'),
  updateLocation: (lat, lng) => api.put('/drivers/location', { lat, lng }),
  getRideRequests: () => api.get('/drivers/ride-requests'),
  acceptRide: (id) => api.put(`/drivers/rides/${id}/accept`),
  rejectRide: (id) => api.put(`/drivers/rides/${id}/reject`),
  arrivingRide: (id) => api.put(`/drivers/rides/${id}/arriving`),
  arrivedRide: (id) => api.put(`/drivers/rides/${id}/arrived`),
  startRide: (id, otp) => api.put(`/drivers/rides/${id}/start`, { otp }),
  completeRide: (id) => api.put(`/drivers/rides/${id}/complete`),
  getEarnings: () => api.get('/drivers/earnings'),
  getProfile: () => api.get('/drivers/profile'),
  getDriverRides: (page = 1) => api.get(`/drivers/rides?page=${page}`),
};

// Payment API
export const paymentAPI = {
  createIntent: (rideId) => api.post('/payments/create-intent', { rideId }),
  confirmPayment: (paymentId) => api.post('/payments/confirm', { paymentId }),
  processCash: (rideId) => api.post('/payments/cash', { rideId }),
  processWallet: (rideId) => api.post('/payments/wallet', { rideId }),
  getHistory: (page = 1) => api.get(`/payments/history?page=${page}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (page = 1, search = '') => api.get(`/admin/users?page=${page}&search=${search}`),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  getDrivers: (page = 1, kycStatus = '') => api.get(`/admin/drivers?page=${page}&kycStatus=${kycStatus}`),
  getDriverAnalysis: (state = '', city = '', district = '') => api.get(`/admin/drivers/analysis?state=${state}&city=${city}&district=${district}`),
  updateDriverKYC: (id, status, rejectionReason) => api.put(`/admin/drivers/${id}/kyc`, { status, rejectionReason }),
  getRides: (page = 1, status = '') => api.get(`/admin/rides?page=${page}&status=${status}`),
  getLiveRides: () => api.get('/admin/rides/live'),
  setSurge: (enabled, multiplier) => api.put('/admin/surge', { enabled, multiplier }),
  getReports: () => api.get('/admin/reports'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  getCoupons: () => api.get('/admin/coupons'),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
};

export default api;
