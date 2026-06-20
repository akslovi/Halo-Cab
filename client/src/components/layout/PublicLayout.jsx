import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, ChevronDown, PhoneIncoming, MailX } from 'lucide-react';

const TwitterIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const FacebookIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const PublicLayout = ({ children }) => {
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = (role) => {
    navigate('/login');
  };

  return (
    <div className="landing-page light-theme" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="landing-navbar animate-fadeIn">
        <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>
          <Car size={36} color="#6366f1" />
          <span className="landing-logo-text">Welcome to Halocab</span>
        </Link>

        <div className="landing-nav-links">
          <Link to="/book" className="landing-link">Book a HaloCab</Link>
          <div className="landing-link-free">Free 1st ride</div>

          <div className="landing-dropdown-container">
            <button
              className="btn btn-secondary"
              onClick={() => setShowLoginMenu(!showLoginMenu)}
              style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-primary)' }}
            >
              Login <ChevronDown size={16} />
            </button>

            {showLoginMenu && (
              <div className="landing-dropdown-menu animate-fadeIn">
                <button className="landing-dropdown-item" onClick={() => handleLoginClick('rider')}>Rider</button>
                <button className="landing-dropdown-item" onClick={() => handleLoginClick('driver')}>Driver</button>
                <button className="landing-dropdown-item" onClick={() => handleLoginClick('admin')}>Admin</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Footer Section */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="footer-section">
            <div className="landing-logo" style={{ marginBottom: '1rem' }}>
              <Car size={32} color="#6366f1" />
              <span className="landing-logo-text" style={{ fontSize: '1.5rem' }}>HaloCab</span>
            </div>
            <p className="footer-address">
              <strong>Corporate Office:</strong><br />
              MayaGanj, Bhagalpur<br />
              Bihar, India <br />

              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PhoneIncoming size={16} />
                +91-8271234568
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MailX size={16} />
                info@halogrid.in
              </span>
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
            <Link to="/support" className="footer-link">Support</Link>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Connect with us</h4>
            <div className="footer-social-links">
              <Link to="/connect/twitter" className="social-icon"><TwitterIcon size={20} /></Link>
              <Link to="/connect/facebook" className="social-icon"><FacebookIcon size={20} /></Link>
              <Link to="/connect/instagram" className="social-icon"><InstagramIcon size={20} /></Link>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>&copy; {new Date().getFullYear()} HaloCab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
