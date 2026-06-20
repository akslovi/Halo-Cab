import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Heart, MessageCircle, Share2, Repeat2,
  Bookmark, MoreHorizontal, ThumbsUp, Eye, Users, MapPin, Link as LinkIcon,
  Calendar, Image, Play, Send
} from 'lucide-react';

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

const platforms = {
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    handle: '@HaloCabIndia',
    icon: <TwitterIcon size={28} />,
    color: '#1DA1F2',
    gradient: 'linear-gradient(135deg, #1DA1F2, #0d8bd9)',
    followers: '125K',
    following: '342',
    bio: 'India\'s smartest ride-hailing platform 🚗 Safe rides, fair fares, happy drivers. Available 24/7 in 50+ cities. Customer support: @HaloCabHelp',
    joined: 'March 2022',
    link: 'halocab.com',
    location: 'Bhagalpur, India',
    verified: true,
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    handle: 'HaloCab',
    icon: <FacebookIcon size={28} />,
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2, #0d5fc2)',
    followers: '340K',
    following: '128',
    bio: 'Your trusted ride partner across India. Book safe, affordable rides anytime, anywhere. Join the HaloCab family! 🚖',
    joined: 'January 2022',
    link: 'halocab.com',
    location: 'Bhagalpur, India',
    verified: true,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    handle: '@halocab',
    icon: <InstagramIcon size={28} />,
    color: '#E4405F',
    gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    followers: '89K',
    following: '215',
    bio: '🚗 Your ride. Your way.\n📍 50+ cities across India\n🔒 Safest rides, always\n📸 Tag us #HaloCabRides',
    joined: 'February 2022',
    link: 'halocab.com',
    location: 'India',
    verified: true,
  },
};

const twitterPosts = [
  {
    id: 1,
    text: '🎉 Exciting news! HaloCab is now live in 10 new cities across Bihar and Jharkhand. Book your first ride and get ₹100 off with code NEWCITY100! 🚗💨',
    time: '2h ago',
    likes: 2340,
    retweets: 856,
    replies: 142,
    views: '45.2K',
  },
  {
    id: 2,
    text: 'Safety is not a feature — it\'s a promise. 🛡️\n\nEvery HaloCab driver passes:\n✅ Background verification\n✅ Vehicle inspection\n✅ Real-time GPS tracking\n✅ In-app SOS button\n\nYour safety, our priority. #HaloCabSafe',
    time: '5h ago',
    likes: 4120,
    retweets: 1230,
    replies: 89,
    views: '92.1K',
  },
  {
    id: 3,
    text: 'Rain or shine, HaloCab gets you there on time! ☔🌞\n\nUse promo code MONSOON50 for 50% off your next 3 rides this season.',
    time: '1d ago',
    likes: 1890,
    retweets: 567,
    replies: 234,
    views: '38.7K',
  },
  {
    id: 4,
    text: 'Meet Ravi, one of our top-rated drivers with a 4.98⭐ rating and 12,000+ rides completed! 🏆\n\n"HaloCab changed my life. I earn well, set my own hours, and love meeting new people every day."\n\n#DriverStories #HaloCabFamily',
    time: '2d ago',
    likes: 5670,
    retweets: 1890,
    replies: 312,
    views: '128K',
  },
];

const facebookPosts = [
  {
    id: 1,
    type: 'update',
    text: '🚀 Big Announcement!\n\nWe\'re thrilled to announce that HaloCab has completed 10 MILLION rides! Thank you to every rider and driver who made this possible. Here\'s to the next 10 million! 🎉🚗\n\n#10MillionRides #HaloCab #ThankYou',
    time: '3 hours ago',
    likes: 12400,
    comments: 890,
    shares: 2340,
    image: true,
  },
  {
    id: 2,
    type: 'event',
    text: '📢 Join us this Saturday for the HaloCab Driver Meet & Greet at MayaGanj, Bhagalpur! 🤝\n\n🗓️ June 21, 2026 | 10 AM - 2 PM\n📍 HaloCab HQ, MayaGanj\n\nFree lunch, prizes, and a chance to meet the team. All HaloCab drivers welcome!\n\n#DriverMeet #Bhagalpur',
    time: '1 day ago',
    likes: 3450,
    comments: 567,
    shares: 890,
  },
  {
    id: 3,
    type: 'tip',
    text: '💡 Did you know? You can split your HaloCab fare with friends!\n\nJust tap "Split Fare" after your ride ends, add your friends, and the fare gets divided equally. Simple, fair, and no awkward money conversations! 😄\n\n#HaloCabTips #RideSmarter',
    time: '3 days ago',
    likes: 2100,
    comments: 345,
    shares: 678,
  },
];

const instagramPosts = [
  {
    id: 1,
    caption: 'City lights look different from the backseat of a HaloCab ✨🌃 Where are you headed tonight?',
    likes: 8920,
    comments: 342,
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    icon: '🌃',
    time: '6h ago',
  },
  {
    id: 2,
    caption: 'Meet our fleet! From Mini to Premium, there\'s a perfect ride for every journey 🚗✨',
    likes: 5430,
    comments: 198,
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    icon: '🚗',
    time: '1d ago',
  },
  {
    id: 3,
    caption: 'Driver appreciation week! 🏆 Shoutout to our amazing drivers who make every ride special.',
    likes: 12100,
    comments: 567,
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    icon: '🏆',
    time: '2d ago',
  },
  {
    id: 4,
    caption: 'Monsoon rides = cozy vibes ☔ Book a HaloCab and stay dry this season!',
    likes: 6780,
    comments: 234,
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    icon: '☔',
    time: '3d ago',
  },
  {
    id: 5,
    caption: 'Behind the scenes at HaloCab HQ 📸 Our team hard at work building the future of mobility!',
    likes: 4560,
    comments: 123,
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
    icon: '📸',
    time: '4d ago',
  },
  {
    id: 6,
    caption: 'Safety first, always 🛡️ Swipe to see all the safety features that protect you on every ride.',
    likes: 9870,
    comments: 445,
    gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    icon: '🛡️',
    time: '5d ago',
  },
];

const formatCount = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};

const SocialConnect = () => {
  const navigate = useNavigate();
  const { platform: urlPlatform } = useParams();
  const [activePlatform, setActivePlatform] = useState(urlPlatform || 'twitter');
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  const platform = platforms[activePlatform];

  const toggleLike = (postId) => {
    const key = `${activePlatform}-${postId}`;
    setLikedPosts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSave = (postId) => {
    const key = `${activePlatform}-${postId}`;
    setSavedPosts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLiked = (postId) => likedPosts[`${activePlatform}-${postId}`];
  const isSaved = (postId) => savedPosts[`${activePlatform}-${postId}`];

  const switchPlatform = (id) => {
    setActivePlatform(id);
    navigate(`/connect/${id}`, { replace: true });
  };

  return (
    <div className="social-page animate-fadeIn">
      {/* Header */}
      <div className="social-header">
        <button className="social-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="social-page-title">
            Connect with <span className="gradient-text">HaloCab</span>
          </h1>
          <p className="social-page-subtitle">Follow us for updates, offers & more</p>
        </div>
      </div>

      {/* Platform tabs */}
      <div className="social-tabs">
        {Object.values(platforms).map((p) => (
          <button
            key={p.id}
            className={`social-tab ${activePlatform === p.id ? 'active' : ''}`}
            onClick={() => switchPlatform(p.id)}
            style={activePlatform === p.id ? { borderColor: p.color, color: p.color } : {}}
          >
            <span className="social-tab-icon" style={{ color: p.color }}>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div className="social-layout">
        {/* Main feed */}
        <div className="social-feed">
          {/* Profile card */}
          <div className="social-profile-card" style={{ '--platform-color': platform.color }}>
            <div className="social-profile-banner" style={{ background: platform.gradient }}>
              <div className="social-banner-pattern" />
            </div>
            <div className="social-profile-body">
              <div className="social-profile-avatar" style={{ background: platform.gradient }}>
                {platform.icon}
              </div>
              <div className="social-profile-info">
                <div className="social-profile-name-row">
                  <h2>{activePlatform === 'facebook' ? 'HaloCab' : 'HaloCab India'}</h2>
                  {platform.verified && (
                    <span className="social-verified-badge" style={{ background: platform.color }}>✓</span>
                  )}
                </div>
                <p className="social-profile-handle">{platform.handle}</p>
                <p className="social-profile-bio">{platform.bio}</p>
                <div className="social-profile-details">
                  <span><MapPin size={14} /> {platform.location}</span>
                  <span><LinkIcon size={14} /> {platform.link}</span>
                  <span><Calendar size={14} /> Joined {platform.joined}</span>
                </div>
                <div className="social-profile-stats">
                  <div className="social-stat">
                    <span className="social-stat-val">{platform.followers}</span>
                    <span className="social-stat-label">Followers</span>
                  </div>
                  <div className="social-stat">
                    <span className="social-stat-val">{platform.following}</span>
                    <span className="social-stat-label">Following</span>
                  </div>
                  <div className="social-stat">
                    <span className="social-stat-val">{activePlatform === 'instagram' ? '486' : activePlatform === 'facebook' ? '1.2K' : '8.4K'}</span>
                    <span className="social-stat-label">{activePlatform === 'instagram' ? 'Posts' : activePlatform === 'facebook' ? 'Posts' : 'Tweets'}</span>
                  </div>
                </div>
              </div>
              <a
                href="#"
                className="social-follow-btn"
                style={{ background: platform.gradient }}
                onClick={(e) => e.preventDefault()}
              >
                Follow on {platform.name}
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Feed posts */}
          <div className="social-posts">
            <h3 className="social-posts-title">
              {activePlatform === 'instagram' ? <Image size={18} /> : <MessageCircle size={18} />}
              Latest {activePlatform === 'twitter' ? 'Tweets' : 'Posts'}
            </h3>

            {/* Twitter feed */}
            {activePlatform === 'twitter' && twitterPosts.map((post) => (
              <div className="social-post twitter-post" key={post.id}>
                <div className="social-post-avatar" style={{ background: platform.gradient }}>
                  {platform.icon}
                </div>
                <div className="social-post-content">
                  <div className="social-post-header">
                    <span className="social-post-name">HaloCab India</span>
                    <span className="social-verified-badge small" style={{ background: platform.color }}>✓</span>
                    <span className="social-post-handle">{platform.handle}</span>
                    <span className="social-post-dot">·</span>
                    <span className="social-post-time">{post.time}</span>
                  </div>
                  <p className="social-post-text">{post.text}</p>
                  <div className="social-post-actions">
                    <button className="social-action-btn" onClick={() => toggleLike(post.id)}>
                      <Heart size={16} fill={isLiked(post.id) ? '#ef4444' : 'none'} color={isLiked(post.id) ? '#ef4444' : 'currentColor'} />
                      <span>{formatCount(post.likes + (isLiked(post.id) ? 1 : 0))}</span>
                    </button>
                    <button className="social-action-btn">
                      <Repeat2 size={16} />
                      <span>{formatCount(post.retweets)}</span>
                    </button>
                    <button className="social-action-btn">
                      <MessageCircle size={16} />
                      <span>{post.replies}</span>
                    </button>
                    <button className="social-action-btn">
                      <Eye size={16} />
                      <span>{post.views}</span>
                    </button>
                    <button className="social-action-btn" onClick={() => toggleSave(post.id)}>
                      <Bookmark size={16} fill={isSaved(post.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Facebook feed */}
            {activePlatform === 'facebook' && facebookPosts.map((post) => (
              <div className="social-post facebook-post" key={post.id}>
                <div className="social-post-fb-header">
                  <div className="social-post-avatar small" style={{ background: platform.gradient }}>
                    {platform.icon}
                  </div>
                  <div>
                    <div className="social-post-name-row">
                      <span className="social-post-name">HaloCab</span>
                      <span className="social-verified-badge small" style={{ background: platform.color }}>✓</span>
                    </div>
                    <span className="social-post-time">{post.time} · 🌐</span>
                  </div>
                  <button className="social-post-more"><MoreHorizontal size={18} /></button>
                </div>
                <p className="social-post-text">{post.text}</p>
                {post.image && (
                  <div className="social-post-image" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <div className="social-post-image-content">
                      <span className="social-post-image-emoji">🎉</span>
                      <span>10 Million Rides</span>
                    </div>
                  </div>
                )}
                <div className="social-post-fb-stats">
                  <span>❤️ 👍 {formatCount(post.likes)}</span>
                  <span>{post.comments} comments · {formatCount(post.shares)} shares</span>
                </div>
                <div className="social-post-fb-actions">
                  <button className={`social-fb-action ${isLiked(post.id) ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                    <ThumbsUp size={16} /> Like
                  </button>
                  <button className="social-fb-action">
                    <MessageCircle size={16} /> Comment
                  </button>
                  <button className="social-fb-action">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            ))}

            {/* Instagram feed */}
            {activePlatform === 'instagram' && (
              <div className="social-insta-grid">
                {instagramPosts.map((post) => (
                  <div className="social-insta-card" key={post.id}>
                    <div className="social-insta-image" style={{ background: post.gradient }}>
                      <span className="social-insta-emoji">{post.icon}</span>
                    </div>
                    <div className="social-insta-body">
                      <div className="social-insta-actions">
                        <button className="social-action-btn" onClick={() => toggleLike(post.id)}>
                          <Heart size={18} fill={isLiked(post.id) ? '#ef4444' : 'none'} color={isLiked(post.id) ? '#ef4444' : 'currentColor'} />
                        </button>
                        <button className="social-action-btn"><MessageCircle size={18} /></button>
                        <button className="social-action-btn"><Send size={18} /></button>
                        <button className="social-action-btn save" onClick={() => toggleSave(post.id)}>
                          <Bookmark size={18} fill={isSaved(post.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <p className="social-insta-likes">{formatCount(post.likes + (isLiked(post.id) ? 1 : 0))} likes</p>
                      <p className="social-insta-caption">
                        <strong>halocab</strong> {post.caption}
                      </p>
                      <p className="social-insta-comments">View all {post.comments} comments</p>
                      <p className="social-insta-time">{post.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="social-sidebar">
          {/* All platforms */}
          <div className="social-sidebar-card">
            <h4>Follow Us Everywhere</h4>
            {Object.values(platforms).map((p) => (
              <button
                key={p.id}
                className={`social-sidebar-link ${activePlatform === p.id ? 'active' : ''}`}
                onClick={() => switchPlatform(p.id)}
              >
                <span className="social-sidebar-icon" style={{ background: `${p.color}15`, color: p.color }}>
                  {p.icon}
                </span>
                <div className="social-sidebar-link-info">
                  <span className="social-sidebar-link-name">{p.name}</span>
                  <span className="social-sidebar-link-handle">{p.handle}</span>
                </div>
                <span className="social-sidebar-followers">{p.followers}</span>
              </button>
            ))}
          </div>

          {/* Hashtag */}
          <div className="social-sidebar-card">
            <h4>#HaloCab Trending</h4>
            <div className="social-hashtags">
              {['#HaloCabRides', '#HaloCabSafe', '#DriverStories', '#RideSmarter', '#HaloCabFamily', '#NewCity'].map((tag, i) => (
                <span key={i} className="social-hashtag">{tag}</span>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="social-sidebar-card stats">
            <h4><Users size={16} /> Community</h4>
            <div className="social-community-stats">
              <div className="social-community-stat">
                <span className="social-community-val">554K+</span>
                <span className="social-community-label">Total Followers</span>
              </div>
              <div className="social-community-stat">
                <span className="social-community-val">50+</span>
                <span className="social-community-label">Cities</span>
              </div>
              <div className="social-community-stat">
                <span className="social-community-val">10M+</span>
                <span className="social-community-label">Rides Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialConnect;
