import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Headphones, BookOpen, MessageCircle, Shield, CreditCard, Navigation, AlertTriangle, HelpCircle } from 'lucide-react';

const faqCategories = [
  {
    icon: <Navigation size={20} />,
    title: 'Rides & Booking',
    faqs: [
      { q: 'How do I book a ride?', a: 'Open the HaloCab app, enter your pickup and drop location, choose your vehicle type, and tap "Book Now". You\'ll be matched with a nearby driver instantly.' },
      { q: 'Can I schedule a ride in advance?', a: 'Yes! While booking, select the "Schedule" option to pick a date and time for your ride. We\'ll assign a driver and notify you before the scheduled pickup.' },
      { q: 'How do I cancel a ride?', a: 'You can cancel a ride from the active ride screen. Please note that cancellations made after driver assignment may incur a small fee.' },
      { q: 'What if no driver is available?', a: 'If no drivers are nearby, you\'ll be added to a queue and notified as soon as a driver becomes available. You can also try again after a few minutes.' },
    ],
  },
  {
    icon: <CreditCard size={20} />,
    title: 'Payments & Pricing',
    faqs: [
      { q: 'What payment methods are accepted?', a: 'We accept Cash, UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and HaloCab Wallet balance.' },
      { q: 'How is the fare calculated?', a: 'Fare is calculated based on distance, estimated time, base fare, and vehicle type. Surge pricing may apply during peak hours.' },
      { q: 'Can I get a receipt for my ride?', a: 'Yes, a digital receipt is automatically sent to your registered email after every completed ride. You can also view it in Ride History.' },
      { q: 'How do I apply a coupon code?', a: 'Enter the coupon code in the promo section before confirming your ride. Discounts will be applied to your final fare automatically.' },
    ],
  },
  {
    icon: <Shield size={20} />,
    title: 'Safety & Security',
    faqs: [
      { q: 'How do you ensure rider safety?', a: 'All drivers undergo thorough background verification, vehicle inspection, and KYC. Every ride is GPS-tracked with an SOS button for emergencies.' },
      { q: 'What should I do in an emergency?', a: 'Tap the SOS button in the app during an active ride. This will alert our safety team and share your live location with your emergency contacts.' },
      { q: 'How do I report a safety concern?', a: 'Go to Ride History, select the ride, and tap "Report Issue". You can also reach our 24/7 safety helpline at +91-8271234568.' },
    ],
  },
  {
    icon: <HelpCircle size={20} />,
    title: 'Account & General',
    faqs: [
      { q: 'How do I create an account?', a: 'Download the HaloCab app or visit our website. Click "Register", enter your details, and verify your phone number with OTP.' },
      { q: 'I forgot my password. How do I reset it?', a: 'On the login screen, select "Phone & OTP" method to log in without a password. You can then update your password from Profile settings.' },
      { q: 'How do I become a driver?', a: 'Register as a "Driver" on the app, complete the KYC process with your documents, and once verified, you can start accepting rides.' },
    ],
  },
];

const supportChannels = [
  {
    icon: <Headphones size={32} />,
    title: '24/7 Helpline',
    desc: 'Call us anytime for urgent help',
    action: '+91-8271234568',
    actionLabel: 'Call Now',
    color: '#10b981',
  },
  {
    icon: <MessageCircle size={32} />,
    title: 'Live Chat',
    desc: 'Chat with our support agents',
    action: '#',
    actionLabel: 'Start Chat',
    color: '#6366f1',
  },
  {
    icon: <BookOpen size={32} />,
    title: 'Help Center',
    desc: 'Browse articles & guides',
    action: '#',
    actionLabel: 'Browse Articles',
    color: '#f59e0b',
  },
  {
    icon: <AlertTriangle size={32} />,
    title: 'Report Issue',
    desc: 'Report a ride or account issue',
    action: '#',
    actionLabel: 'Report Now',
    color: '#ef4444',
  },
];

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`info-faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="info-faq-question">
        <span>{question}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {open && (
        <div className="info-faq-answer animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  );
};

const Support = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="info-page animate-fadeIn">
      {/* Hero */}
      <section className="info-hero">
        <div className="info-hero-glow"></div>
        <h1 className="info-hero-title">Help & <span className="gradient-text">Support</span></h1>
        <p className="info-hero-subtitle">
          We're here for you — 24/7. Find answers, get help, or reach out to our team.
        </p>
      </section>

      {/* Support Channels */}
      <section className="info-support-grid">
        {supportChannels.map((ch, i) => (
          <div className="info-support-card" key={i} style={{ animationDelay: `${i * 80}ms` }}>
            <div className="info-support-icon" style={{ color: ch.color, background: `${ch.color}15` }}>
              {ch.icon}
            </div>
            <h3 className="info-support-title">{ch.title}</h3>
            <p className="info-support-desc">{ch.desc}</p>
            <button
              className="btn btn-secondary btn-sm info-support-btn"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => {
                if (ch.title === 'Live Chat') navigate('/support/chat');
                else if (ch.title === '24/7 Helpline') navigate('/support/call');
                else if (ch.title === 'Help Center') navigate('/support/help-center');
              }}
            >
              {ch.actionLabel}
            </button>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="info-section">
        <h2 className="info-section-title">Frequently Asked Questions</h2>

        {/* Category Tabs */}
        <div className="info-faq-tabs">
          {faqCategories.map((cat, i) => (
            <button
              key={i}
              className={`info-faq-tab ${activeCategory === i ? 'active' : ''}`}
              onClick={() => setActiveCategory(i)}
            >
              {cat.icon}
              <span>{cat.title}</span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="info-faq-list">
          {faqCategories[activeCategory].faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="info-cta-section">
        <div className="info-cta-card">
          <h2>Still need help?</h2>
          <p>Our support team is always ready to assist you. Reach out and we'll respond within minutes.</p>
          <div className="info-cta-actions">
            <a href="mailto:support@halocab.com" className="btn btn-primary btn-lg">Email Support</a>
            <a href="tel:+918271234568" className="btn btn-secondary btn-lg" style={{ color: 'var(--text-primary)' }}>Call +91-8271234568</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
