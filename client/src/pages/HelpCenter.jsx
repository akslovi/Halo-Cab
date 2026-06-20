import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, BookOpen, Navigation, CreditCard, Shield, HelpCircle,
  Clock, ChevronRight, Star, TrendingUp, Eye, ThumbsUp, ThumbsDown,
  Car, MapPin, Smartphone, Wallet, Users, FileText, Award, Zap,
  ArrowRight, X, ChevronDown, ChevronUp
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Topics', icon: <BookOpen size={18} />, color: '#6366f1' },
  { id: 'rides', label: 'Rides & Booking', icon: <Navigation size={18} />, color: '#10b981' },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={18} />, color: '#f59e0b' },
  { id: 'safety', label: 'Safety', icon: <Shield size={18} />, color: '#ef4444' },
  { id: 'account', label: 'Account', icon: <HelpCircle size={18} />, color: '#3b82f6' },
  { id: 'driver', label: 'Driver Guide', icon: <Car size={18} />, color: '#8b5cf6' },
];

const articles = [
  {
    id: 1,
    category: 'rides',
    title: 'How to Book Your First Ride on HaloCab',
    excerpt: 'A step-by-step guide to booking your first ride — from entering your pickup location to confirming your trip and meeting your driver.',
    readTime: '3 min read',
    views: 12450,
    helpful: 94,
    featured: true,
    tags: ['getting-started', 'booking'],
    content: [
      { heading: 'Step 1: Open the App', text: 'Launch the HaloCab app on your phone. If you haven\'t registered yet, tap "Sign Up" and create an account with your phone number.' },
      { heading: 'Step 2: Enter Your Destination', text: 'Tap the search bar at the top and type your drop-off location. The app will also auto-detect your current location as the pickup point.' },
      { heading: 'Step 3: Choose Your Ride', text: 'Browse available vehicle types — Mini, Sedan, SUV, or Premium. Compare prices and estimated arrival times.' },
      { heading: 'Step 4: Confirm & Pay', text: 'Tap "Book Now" to confirm. Choose your payment method (Cash, UPI, Card, or Wallet) and your driver will be assigned within seconds.' },
      { heading: 'Step 5: Track & Ride', text: 'Track your driver in real-time on the map. You\'ll receive notifications when they\'re nearby. Enjoy your ride!' },
    ],
  },
  {
    id: 2,
    category: 'rides',
    title: 'Scheduling a Ride in Advance',
    excerpt: 'Need a ride tomorrow morning? Learn how to schedule rides up to 7 days in advance and never miss an appointment.',
    readTime: '2 min read',
    views: 8320,
    helpful: 91,
    tags: ['scheduling', 'booking'],
    content: [
      { heading: 'Why Schedule?', text: 'Scheduling is perfect for airport pickups, early morning meetings, or any time you need guaranteed availability.' },
      { heading: 'How to Schedule', text: 'While booking, tap the "Schedule" icon next to the "Book Now" button. Select your preferred date and time, then confirm.' },
      { heading: 'Managing Scheduled Rides', text: 'View and manage your scheduled rides from the "My Rides" section. You can cancel or modify up to 30 minutes before the pickup time.' },
    ],
  },
  {
    id: 3,
    category: 'rides',
    title: 'Understanding Surge Pricing',
    excerpt: 'Learn why fares sometimes increase during peak hours and how HaloCab\'s dynamic pricing works to keep drivers available.',
    readTime: '4 min read',
    views: 15800,
    helpful: 78,
    tags: ['pricing', 'fares'],
    content: [
      { heading: 'What is Surge Pricing?', text: 'Surge pricing kicks in when rider demand exceeds driver supply in a particular area. This helps attract more drivers to serve you faster.' },
      { heading: 'When Does It Happen?', text: 'Common surge times include rush hours (8-10 AM, 5-8 PM), rainy weather, festivals, and special events.' },
      { heading: 'How to Avoid Surge', text: 'Wait a few minutes for prices to drop, walk to a nearby area with lower demand, or schedule your ride during off-peak hours.' },
    ],
  },
  {
    id: 4,
    category: 'payments',
    title: 'Accepted Payment Methods on HaloCab',
    excerpt: 'From cash to UPI, credit cards to wallet — explore all the ways you can pay for your rides on HaloCab.',
    readTime: '2 min read',
    views: 9870,
    helpful: 96,
    featured: true,
    tags: ['payments', 'upi', 'wallet'],
    content: [
      { heading: 'Cash', text: 'Pay your driver directly in cash at the end of your ride. No setup needed.' },
      { heading: 'UPI', text: 'Link your Google Pay, PhonePe, or Paytm for seamless one-tap payments.' },
      { heading: 'Credit/Debit Cards', text: 'Add your Visa, Mastercard, or RuPay card in the Payment section. Your card details are encrypted and secure.' },
      { heading: 'HaloCab Wallet', text: 'Top up your wallet for the fastest checkout. Wallet payments are processed instantly with no additional charges.' },
    ],
  },
  {
    id: 5,
    category: 'payments',
    title: 'How to Request a Refund',
    excerpt: 'Overcharged or had a cancelled ride? Here\'s how to request a refund and what to expect during the process.',
    readTime: '3 min read',
    views: 22100,
    helpful: 88,
    tags: ['refund', 'billing'],
    content: [
      { heading: 'Eligible Scenarios', text: 'Refunds are available for overcharges, cancelled rides where you were incorrectly billed, driver no-shows, and service quality issues.' },
      { heading: 'How to Request', text: 'Go to Ride History → Select the ride → Tap "Report Issue" → Choose "Request Refund". Provide a brief description of the issue.' },
      { heading: 'Processing Time', text: 'Refunds to your original payment method take 3-5 business days. Wallet refunds are processed instantly.' },
    ],
  },
  {
    id: 6,
    category: 'payments',
    title: 'Using Coupon Codes & Promotions',
    excerpt: 'Save money on rides with promo codes, referral bonuses, and seasonal offers. Learn how to apply them.',
    readTime: '2 min read',
    views: 18400,
    helpful: 95,
    tags: ['coupons', 'promotions', 'savings'],
    content: [
      { heading: 'Where to Find Coupons', text: 'Check the "Offers" section in the app, your email for exclusive deals, and our social media pages for flash promotions.' },
      { heading: 'How to Apply', text: 'On the booking screen, tap "Apply Coupon" and enter your promo code. The discount will be reflected in your fare estimate.' },
      { heading: 'Referral Program', text: 'Share your unique referral code with friends. Both you and your friend get ₹100 off when they complete their first ride!' },
    ],
  },
  {
    id: 7,
    category: 'safety',
    title: 'Safety Features Every Rider Should Know',
    excerpt: 'HaloCab is built with your safety in mind. Learn about SOS alerts, ride sharing, driver verification, and more.',
    readTime: '5 min read',
    views: 31200,
    helpful: 97,
    featured: true,
    tags: ['safety', 'sos', 'security'],
    content: [
      { heading: 'SOS Button', text: 'During any active ride, tap the SOS button to instantly alert our safety team and your emergency contacts with your live location.' },
      { heading: 'Share Your Ride', text: 'Share your ride details and live location with family or friends for added safety, especially during late-night travels.' },
      { heading: 'Driver Verification', text: 'Every driver undergoes background checks, KYC verification, and vehicle inspection before they can accept rides.' },
      { heading: 'Trip Insurance', text: 'All HaloCab rides include complimentary trip insurance covering accidents during the ride.' },
    ],
  },
  {
    id: 8,
    category: 'safety',
    title: 'What to Do in an Emergency During a Ride',
    excerpt: 'Your safety is our priority. Know exactly what steps to take if you ever feel unsafe during a HaloCab ride.',
    readTime: '3 min read',
    views: 14500,
    helpful: 99,
    tags: ['emergency', 'sos'],
    content: [
      { heading: 'Use the SOS Button', text: 'Tap the SOS button immediately. This silently alerts our safety team who will contact you and dispatch help if needed.' },
      { heading: 'Call Emergency Services', text: 'If you\'re in immediate danger, call 112 (national emergency number) directly from the app.' },
      { heading: 'Share Live Location', text: 'The app can instantly share your GPS location with your emergency contacts. Set these up in advance under Settings > Safety.' },
      { heading: 'Report After the Ride', text: 'File a detailed report through the app. Our safety team investigates all reports within 24 hours.' },
    ],
  },
  {
    id: 9,
    category: 'account',
    title: 'Creating and Verifying Your Account',
    excerpt: 'Get started with HaloCab in minutes. Set up your profile, verify your phone, and start booking rides.',
    readTime: '2 min read',
    views: 7600,
    helpful: 92,
    tags: ['registration', 'getting-started'],
    content: [
      { heading: 'Download the App', text: 'Get HaloCab from the Google Play Store or Apple App Store. You can also use our website at halocab.com.' },
      { heading: 'Register', text: 'Tap "Sign Up", enter your name, email, and phone number. Verify with the OTP sent to your phone.' },
      { heading: 'Complete Your Profile', text: 'Add a profile photo and set up your preferred payment method. You\'re now ready to book your first ride!' },
    ],
  },
  {
    id: 10,
    category: 'account',
    title: 'Managing Your Profile and Settings',
    excerpt: 'Update your name, phone number, email, saved addresses, and preferences all from one place.',
    readTime: '2 min read',
    views: 5400,
    helpful: 90,
    tags: ['profile', 'settings'],
    content: [
      { heading: 'Access Profile', text: 'Tap the menu icon > Profile to view and edit your personal information.' },
      { heading: 'Saved Addresses', text: 'Save your home, work, and frequently visited places for faster booking.' },
      { heading: 'Notification Preferences', text: 'Customize which notifications you receive — ride updates, promotions, safety alerts, and more.' },
    ],
  },
  {
    id: 11,
    category: 'driver',
    title: 'How to Register as a HaloCab Driver',
    excerpt: 'Start earning with HaloCab. Complete guide to driver registration, KYC verification, and getting your first ride request.',
    readTime: '5 min read',
    views: 19800,
    helpful: 93,
    featured: true,
    tags: ['driver', 'registration', 'kyc'],
    content: [
      { heading: 'Eligibility', text: 'You need a valid driving license, vehicle registration, commercial insurance, and a smartphone with internet access.' },
      { heading: 'Registration Steps', text: 'Download the app > Sign Up as Driver > Upload your documents (DL, RC, Aadhar, PAN) > Complete your vehicle inspection.' },
      { heading: 'KYC Verification', text: 'Our team verifies your documents within 24-48 hours. You\'ll receive an approval notification once done.' },
      { heading: 'Start Earning', text: 'Once approved, go online in the app to start receiving ride requests. Complete your first 10 rides to unlock bonus earnings!' },
    ],
  },
  {
    id: 12,
    category: 'driver',
    title: 'Understanding Driver Earnings and Payouts',
    excerpt: 'Learn how HaloCab driver earnings work — fare breakdowns, incentives, bonuses, and weekly payout schedules.',
    readTime: '4 min read',
    views: 16300,
    helpful: 89,
    tags: ['earnings', 'payouts', 'incentives'],
    content: [
      { heading: 'Fare Structure', text: 'Your earnings per ride = Base Fare + Per KM charge + Per Minute charge - HaloCab commission (15-20%).' },
      { heading: 'Incentives', text: 'Complete daily ride targets to unlock bonus incentives. Peak hour rides earn you 1.5x-2x of the normal rate.' },
      { heading: 'Payouts', text: 'Earnings are settled weekly every Monday. You can also request instant payouts to your bank account (₹10 fee applies).' },
    ],
  },
];

const popularSearches = ['book a ride', 'refund', 'cancel ride', 'payment failed', 'driver registration', 'coupon code', 'safety', 'surge pricing'];

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [feedback, setFeedback] = useState({});

  const filteredArticles = useMemo(() => {
    let result = articles;

    if (activeCategory !== 'all') {
      result = result.filter((a) => a.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q))
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  const featuredArticles = articles.filter((a) => a.featured);

  const toggleSection = (idx) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleFeedback = (articleId, type) => {
    setFeedback((prev) => ({ ...prev, [articleId]: type }));
  };

  const getCategoryInfo = (catId) => categories.find((c) => c.id === catId);

  // Article detail view
  if (selectedArticle) {
    const article = selectedArticle;
    const catInfo = getCategoryInfo(article.category);

    return (
      <div className="helpcenter-page animate-fadeIn">
        <div className="helpcenter-article-view">
          {/* Breadcrumb */}
          <div className="helpcenter-breadcrumb">
            <button className="helpcenter-breadcrumb-link" onClick={() => setSelectedArticle(null)}>
              <ArrowLeft size={16} /> Help Center
            </button>
            <ChevronRight size={14} />
            <span style={{ color: catInfo?.color }}>{catInfo?.label}</span>
          </div>

          {/* Article content */}
          <article className="helpcenter-article-content">
            <div className="helpcenter-article-category" style={{ color: catInfo?.color, background: `${catInfo?.color}12` }}>
              {catInfo?.icon} {catInfo?.label}
            </div>
            <h1 className="helpcenter-article-title">{article.title}</h1>
            <div className="helpcenter-article-meta">
              <span><Clock size={14} /> {article.readTime}</span>
              <span><Eye size={14} /> {article.views.toLocaleString()} views</span>
              <span><ThumbsUp size={14} /> {article.helpful}% found helpful</span>
            </div>

            <p className="helpcenter-article-intro">{article.excerpt}</p>

            <div className="helpcenter-article-sections">
              {article.content.map((section, idx) => (
                <div className="helpcenter-article-section" key={idx}>
                  <button
                    className={`helpcenter-section-header ${expandedSections[idx] !== false ? 'expanded' : ''}`}
                    onClick={() => toggleSection(idx)}
                  >
                    <div className="helpcenter-section-num">{idx + 1}</div>
                    <h3>{section.heading}</h3>
                    {expandedSections[idx] === false ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                  {expandedSections[idx] !== false && (
                    <div className="helpcenter-section-body animate-fadeIn">
                      <p>{section.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div className="helpcenter-feedback-card">
              <p>Was this article helpful?</p>
              <div className="helpcenter-feedback-btns">
                <button
                  className={`helpcenter-feedback-btn ${feedback[article.id] === 'yes' ? 'active-yes' : ''}`}
                  onClick={() => handleFeedback(article.id, 'yes')}
                >
                  <ThumbsUp size={18} /> Yes
                </button>
                <button
                  className={`helpcenter-feedback-btn ${feedback[article.id] === 'no' ? 'active-no' : ''}`}
                  onClick={() => handleFeedback(article.id, 'no')}
                >
                  <ThumbsDown size={18} /> No
                </button>
              </div>
              {feedback[article.id] && (
                <p className="helpcenter-feedback-thanks animate-fadeIn">
                  Thank you for your feedback! 🙏
                </p>
              )}
            </div>

            {/* Related articles */}
            <div className="helpcenter-related">
              <h3>Related Articles</h3>
              <div className="helpcenter-related-list">
                {articles
                  .filter((a) => a.category === article.category && a.id !== article.id)
                  .slice(0, 3)
                  .map((a) => (
                    <button
                      key={a.id}
                      className="helpcenter-related-item"
                      onClick={() => {
                        setSelectedArticle(a);
                        setExpandedSections({});
                        window.scrollTo(0, 0);
                      }}
                    >
                      <span>{a.title}</span>
                      <ArrowRight size={16} />
                    </button>
                  ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="helpcenter-article-sidebar">
            <div className="helpcenter-toc-card">
              <h4><FileText size={16} /> In This Article</h4>
              <ul>
                {article.content.map((section, idx) => (
                  <li key={idx} onClick={() => toggleSection(idx)}>
                    <span className="helpcenter-toc-num">{idx + 1}</span>
                    {section.heading}
                  </li>
                ))}
              </ul>
            </div>

            <div className="helpcenter-need-help-card">
              <h4>Still Need Help?</h4>
              <p>Can't find what you're looking for?</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/support/chat')}>
                Chat with Us
              </button>
              <button className="btn btn-secondary btn-sm" style={{ color: 'var(--text-primary)' }} onClick={() => navigate('/support/call')}>
                Call Support
              </button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Main listing view
  return (
    <div className="helpcenter-page animate-fadeIn">
      {/* Header */}
      <div className="helpcenter-header">
        <button className="helpcenter-back-btn" onClick={() => navigate('/support')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="helpcenter-title">
            Help <span className="gradient-text">Center</span>
          </h1>
          <p className="helpcenter-subtitle">Browse articles, guides & tutorials</p>
        </div>
      </div>

      {/* Search */}
      <div className="helpcenter-search-section">
        <div className="helpcenter-search-box">
          <Search size={20} className="helpcenter-search-icon" />
          <input
            type="text"
            className="helpcenter-search-input"
            placeholder="Search articles, guides, and topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="helpcenter-search-clear" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="helpcenter-popular-searches">
          <span className="helpcenter-popular-label">Popular:</span>
          {popularSearches.map((term, i) => (
            <button
              key={i}
              className="helpcenter-popular-chip"
              onClick={() => setSearchQuery(term)}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Featured (only when no search and all category) */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="helpcenter-featured-section">
          <h2 className="helpcenter-section-title">
            <Star size={18} /> Featured Articles
          </h2>
          <div className="helpcenter-featured-grid">
            {featuredArticles.map((article) => {
              const catInfo = getCategoryInfo(article.category);
              return (
                <button
                  key={article.id}
                  className="helpcenter-featured-card"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="helpcenter-featured-badge" style={{ color: catInfo?.color, background: `${catInfo?.color}12` }}>
                    {catInfo?.icon} {catInfo?.label}
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <div className="helpcenter-featured-footer">
                    <span><Clock size={12} /> {article.readTime}</span>
                    <span><Eye size={12} /> {article.views.toLocaleString()}</span>
                    <span className="helpcenter-read-link">Read →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <div className="helpcenter-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`helpcenter-cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            style={activeCategory === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Articles list */}
      <div className="helpcenter-articles-section">
        <div className="helpcenter-articles-header">
          <h2 className="helpcenter-section-title">
            <BookOpen size={18} />
            {activeCategory === 'all' ? 'All Articles' : getCategoryInfo(activeCategory)?.label}
          </h2>
          <span className="helpcenter-articles-count">{filteredArticles.length} articles</span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="helpcenter-empty">
            <Search size={48} />
            <h3>No articles found</h3>
            <p>Try a different search term or browse categories</p>
            <button className="btn btn-secondary" style={{ color: 'var(--text-primary)' }} onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="helpcenter-articles-list">
            {filteredArticles.map((article, i) => {
              const catInfo = getCategoryInfo(article.category);
              return (
                <button
                  key={article.id}
                  className="helpcenter-article-card"
                  onClick={() => setSelectedArticle(article)}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="helpcenter-article-card-left">
                    <div className="helpcenter-article-icon" style={{ color: catInfo?.color, background: `${catInfo?.color}12` }}>
                      {catInfo?.icon}
                    </div>
                  </div>
                  <div className="helpcenter-article-card-body">
                    <div className="helpcenter-article-card-cat" style={{ color: catInfo?.color }}>
                      {catInfo?.label}
                    </div>
                    <h3 className="helpcenter-article-card-title">{article.title}</h3>
                    <p className="helpcenter-article-card-excerpt">{article.excerpt}</p>
                    <div className="helpcenter-article-card-meta">
                      <span><Clock size={12} /> {article.readTime}</span>
                      <span><Eye size={12} /> {article.views.toLocaleString()}</span>
                      <span><ThumbsUp size={12} /> {article.helpful}%</span>
                    </div>
                  </div>
                  <div className="helpcenter-article-card-arrow">
                    <ChevronRight size={20} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="helpcenter-bottom-cta">
        <div className="helpcenter-cta-icon">
          <Zap size={24} />
        </div>
        <div>
          <h3>Can't find what you need?</h3>
          <p>Our support team is available 24/7 to help you.</p>
        </div>
        <div className="helpcenter-cta-actions">
          <button className="btn btn-primary" onClick={() => navigate('/support/chat')}>
            Live Chat
          </button>
          <button className="btn btn-secondary" style={{ color: 'var(--text-primary)' }} onClick={() => navigate('/support/call')}>
            Call Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
