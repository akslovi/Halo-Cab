import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import BookingPage from './pages/user/BookingPage';
import RideHistory from './pages/user/RideHistory';
import ProfilePage from './pages/user/ProfilePage';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverEarnings from './pages/driver/DriverEarnings';
import DriverKYC from './pages/driver/DriverKYC';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminLiveMap from './pages/admin/AdminLiveMap';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminDriverAnalysis from './pages/admin/AdminDriverAnalysis';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Support from './pages/Support';
import LiveChat from './pages/LiveChat';
import CallNow from './pages/CallNow';
import HelpCenter from './pages/HelpCenter';
import SocialConnect from './pages/SocialConnect';
import PublicLayout from './components/layout/PublicLayout';

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'driver') return <Navigate to="/driver" />;
    return <Navigate to="/book" />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={isAuthenticated
            ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'driver' ? '/driver' : '/book'} />
            : <PublicLayout><LandingPage /></PublicLayout>
          }
        />
        <Route
          path="/login"
          element={isAuthenticated
            ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'driver' ? '/driver' : '/book'} />
            : <PublicLayout><LandingPage /><Login /></PublicLayout>
          }
        />
        <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactUs /></PublicLayout>} />
        <Route path="/support" element={<PublicLayout><Support /></PublicLayout>} />
        <Route path="/support/chat" element={<PublicLayout><LiveChat /></PublicLayout>} />
        <Route path="/support/call" element={<PublicLayout><CallNow /></PublicLayout>} />
        <Route path="/support/help-center" element={<PublicLayout><HelpCenter /></PublicLayout>} />
        <Route path="/connect/:platform" element={<PublicLayout><SocialConnect /></PublicLayout>} />

        {/* User Routes */}
        <Route path="/book" element={
          <ProtectedRoute roles={['user']}><BookingPage /></ProtectedRoute>
        } />
        <Route path="/rides" element={
          <ProtectedRoute roles={['user']}><RideHistory /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute roles={['user', 'driver']}><ProfilePage /></ProtectedRoute>
        } />

        {/* Driver Routes */}
        <Route path="/driver" element={
          <ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>
        } />
        <Route path="/driver/earnings" element={
          <ProtectedRoute roles={['driver']}><DriverEarnings /></ProtectedRoute>
        } />
        <Route path="/driver/kyc" element={
          <ProtectedRoute roles={['driver']}><DriverKYC /></ProtectedRoute>
        } />
        <Route path="/driver/rides" element={
          <ProtectedRoute roles={['driver']}><RideHistory /></ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
        } />
        <Route path="/admin/drivers" element={
          <ProtectedRoute roles={['admin']}><AdminDrivers /></ProtectedRoute>
        } />
        <Route path="/admin/rides" element={
          <ProtectedRoute roles={['admin']}><RideHistory /></ProtectedRoute>
        } />
        <Route path="/admin/live" element={
          <ProtectedRoute roles={['admin']}><AdminLiveMap /></ProtectedRoute>
        } />
        <Route path="/admin/coupons" element={
          <ProtectedRoute roles={['admin']}><AdminCoupons /></ProtectedRoute>
        } />
        <Route path="/admin/analysis" element={
          <ProtectedRoute roles={['admin']}><AdminDriverAnalysis /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#f0f0f5',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1a1a2e' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
