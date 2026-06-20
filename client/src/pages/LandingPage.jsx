import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, MapPin } from 'lucide-react';

const CAROUSEL_IMAGES = [
  '/halocab1.png',
  '/halocab2.png',
  '/halocab3.png',
];

const LandingPage = () => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <main className="landing-hero animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <div className="landing-glow"></div>

        <div className="landing-hero-content">
          <h1 className="landing-title">
            Your Premium Ride,<br />One Tap Away
          </h1>
          <p className="landing-subtitle">
            Experience the ultimate comfort, safety, and reliability with HaloCab.
            Whether you need a quick bike ride through traffic or a premium cab for a special occasion, we are always ready.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/book')}>
              Book Now
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')} style={{ color: 'var(--text-primary)' }}>
              Join as Driver
            </button>
          </div>

          <div className="landing-features" style={{ display: 'flex', gap: '2rem', marginTop: '4rem' }}>
            <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={24} color="var(--success)" />
              <span>Verified Drivers</span>
            </div>
            <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Clock size={24} color="var(--warning)" />
              <span>24/7 Support</span>
            </div>
            <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <MapPin size={24} color="var(--primary-light)" />
              <span>Live Tracking</span>
            </div>
          </div>
        </div>

        <div className="landing-hero-image animate-fadeIn" style={{ animationDelay: '300ms' }}>
          {/* Realistic Image Carousel */}
          <div className="landing-carousel-container">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Premium HaloCab"
                className={`landing-carousel-image ${idx === currentImageIdx ? 'active' : ''}`}
              />
            ))}
            {/* Dots indicator */}
            <div className="carousel-dots">
              {CAROUSEL_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  className={`carousel-dot ${idx === currentImageIdx ? 'active' : ''}`}
                  onClick={() => setCurrentImageIdx(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default LandingPage;
