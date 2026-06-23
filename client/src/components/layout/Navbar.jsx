import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import {
  Car, MapPin, History, User, LayoutDashboard,
  LogOut, Users, Shield, BarChart3, Ticket, Map, Zap, Menu, X, FileText
} from 'lucide-react';
import { useState } from 'react';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { user, driverProfile, logout, isAdmin, isDriver } = useAuth();
  const { connected } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const kycNeeded = isDriver && (!driverProfile || driverProfile.kyc?.status !== 'approved');

  const userLinks = [
    { to: '/book', icon: <MapPin size={18} />, label: 'Book Ride' },
    { to: '/rides', icon: <History size={18} />, label: 'My Rides' },
    { to: '/profile', icon: <User size={18} />, label: 'Profile' },
  ];

  const driverLinks = [
    { to: '/driver', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/driver/earnings', icon: <BarChart3 size={18} />, label: 'Earnings' },
    { to: '/driver/rides', icon: <History size={18} />, label: 'Rides' },
    { to: '/driver/kyc', icon: <FileText size={18} />, label: 'KYC' },
    { to: '/profile', icon: <User size={18} />, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    { to: '/admin/drivers', icon: <Shield size={18} />, label: 'Drivers' },
    { to: '/admin/analysis', icon: <BarChart3 size={18} />, label: 'Analysis' },
    { to: '/admin/rides', icon: <Car size={18} />, label: 'Rides' },
    { to: '/admin/live', icon: <Map size={18} />, label: 'Live Map' },
    { to: '/admin/coupons', icon: <Ticket size={18} />, label: 'Coupons' },
  ];

  const links = isAdmin ? adminLinks : isDriver ? driverLinks : userLinks;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? '/admin' : isDriver ? '/driver' : '/book'} className="navbar-brand">
          <Car size={24} style={{ color: '#6366f1' }} />
          HaloCab
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
            {connected && (
              <div
                title="Live connected"
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                }}
              />
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout" id="logout-btn">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <button
          className="navbar-mobile-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          id="mobile-menu-btn"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
