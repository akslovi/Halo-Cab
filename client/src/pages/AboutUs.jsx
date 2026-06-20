import { ShieldCheck, Users, MapPin, Zap, Heart, Target, TrendingUp, Award } from 'lucide-react';

const stats = [
  { icon: <Users size={28} />, value: '50,000+', label: 'Happy Riders' },
  { icon: <MapPin size={28} />, value: '25+', label: 'Cities Active' },
  { icon: <TrendingUp size={28} />, value: '1M+', label: 'Rides Completed' },
  { icon: <Award size={28} />, value: '10,000+', label: 'Verified Drivers' },
];

const values = [
  {
    icon: <ShieldCheck size={32} />,
    title: 'Safety First',
    description: 'Every ride is monitored with real-time GPS tracking, SOS alerts, and verified driver backgrounds for your complete peace of mind.',
  },
  {
    icon: <Zap size={32} />,
    title: 'Lightning Fast',
    description: 'Our smart matching algorithm connects you with the nearest driver in seconds, minimizing wait times and maximizing convenience.',
  },
  {
    icon: <Heart size={32} />,
    title: 'Customer Love',
    description: 'We listen, we improve, we deliver. Our 24/7 support team ensures every concern is addressed with care and speed.',
  },
  {
    icon: <Target size={32} />,
    title: 'Fair Pricing',
    description: 'Transparent fare calculations with no hidden charges. What you see is what you pay — always.',
  },
];

const timeline = [
  { year: '2023', title: 'Founded in Bhagalpur', desc: 'HaloCab was born with a vision to transform local transportation.' },
  { year: '2024', title: 'Expanded to 10 Cities', desc: 'Rapid growth brought HaloCab to major cities across Bihar and Jharkhand.' },
  { year: '2025', title: 'Crossed 1M Rides', desc: 'A milestone that proved the trust of our riders and the dedication of our drivers.' },
  { year: '2026', title: 'Going National', desc: 'Expanding across India with premium services and advanced technology.' },
];

const AboutUs = () => {
  return (
    <div className="info-page animate-fadeIn">
      {/* Hero */}
      <section className="info-hero">
        <div className="info-hero-glow"></div>
        <h1 className="info-hero-title">About <span className="gradient-text">HaloCab</span></h1>
        <p className="info-hero-subtitle">
          We're on a mission to make urban transportation safe, affordable, and delightful for everyone.
        </p>
      </section>

      {/* Stats */}
      <section className="info-stats-grid">
        {stats.map((stat, i) => (
          <div className="info-stat-card" key={i} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="info-stat-icon">{stat.icon}</div>
            <div className="info-stat-value">{stat.value}</div>
            <div className="info-stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Our Story */}
      <section className="info-section">
        <h2 className="info-section-title">Our Story</h2>
        <div className="info-story-card">
          <p>
            HaloCab started with a simple idea — everyone deserves a safe and comfortable ride.
            Founded in 2023 in the heart of Bhagalpur, Bihar, we set out to bridge the gap between
            riders and reliable transportation.
          </p>
          <p>
            What began as a small fleet of verified drivers has now grown into a thriving community
            of thousands, serving riders across multiple cities. Our technology-driven approach ensures
            that every ride is tracked, every driver is verified, and every experience is memorable.
          </p>
          <p>
            Today, HaloCab stands as a symbol of trust, innovation, and commitment to excellence
            in the ride-hailing industry.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="info-section">
        <h2 className="info-section-title">What We Stand For</h2>
        <div className="info-values-grid">
          {values.map((v, i) => (
            <div className="info-value-card" key={i}>
              <div className="info-value-icon">{v.icon}</div>
              <h3 className="info-value-title">{v.title}</h3>
              <p className="info-value-desc">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="info-section">
        <h2 className="info-section-title">Our Journey</h2>
        <div className="info-timeline">
          {timeline.map((t, i) => (
            <div className="info-timeline-item" key={i}>
              <div className="info-timeline-marker">
                <div className="info-timeline-dot"></div>
                {i < timeline.length - 1 && <div className="info-timeline-line"></div>}
              </div>
              <div className="info-timeline-content">
                <span className="info-timeline-year">{t.year}</span>
                <h4 className="info-timeline-title">{t.title}</h4>
                <p className="info-timeline-desc">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
