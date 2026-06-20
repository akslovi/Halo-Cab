import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX,
  Clock, Shield, Headphones, Star, MapPin, Globe, ChevronRight,
  PhoneCall, PhoneForwarded, Users, CheckCircle, AlertCircle, Hash
} from 'lucide-react';

const CUSTOMER_CARE = '+91-8271234568';
const CUSTOMER_CARE_RAW = '+918271234568';

const supportLines = [
  {
    icon: <Headphones size={20} />,
    title: 'General Support',
    number: '+91-8271234568',
    hours: '24/7',
    color: '#6366f1',
    wait: '~30 sec',
  },
  {
    icon: <Shield size={20} />,
    title: 'Safety Helpline',
    number: '+91-8271234569',
    hours: '24/7',
    color: '#ef4444',
    wait: '~15 sec',
  },
  {
    icon: <PhoneForwarded size={20} />,
    title: 'Ride Assistance',
    number: '+91-8271234570',
    hours: '6 AM – 12 AM',
    color: '#10b981',
    wait: '~1 min',
  },
  {
    icon: <Hash size={20} />,
    title: 'Billing & Payments',
    number: '+91-8271234571',
    hours: '9 AM – 9 PM',
    color: '#f59e0b',
    wait: '~2 min',
  },
];

const callTips = [
  'Keep your registered phone number handy',
  'Have your ride ID ready for faster resolution',
  'Calls may be recorded for quality assurance',
  'For emergencies during a ride, use the in-app SOS button',
];

const CallNow = () => {
  const navigate = useNavigate();
  const [callState, setCallState] = useState('idle'); // idle | ringing | connected | ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [showDialer, setShowDialer] = useState(false);
  const [dialerInput, setDialerInput] = useState('');
  const timerRef = useRef(null);
  const ringTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    };
  }, []);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCall = (line) => {
    setSelectedLine(line || supportLines[0]);
    setCallState('ringing');
    setCallDuration(0);

    // Simulate ringing for 3 seconds, then connect
    ringTimerRef.current = setTimeout(() => {
      setCallState('connected');
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 3000);
  };

  const endCall = () => {
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);

    // Reset after showing ended state
    setTimeout(() => {
      setCallState('idle');
      setSelectedLine(null);
      setIsMuted(false);
      setIsSpeaker(false);
      setCallDuration(0);
    }, 2000);
  };

  const handleDialerKey = (key) => {
    setDialerInput((prev) => prev + key);
  };

  const dialerKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  // Active call overlay
  if (callState !== 'idle') {
    return (
      <div className="callnow-page animate-fadeIn">
        <div className="callnow-active-overlay">
          <div className="callnow-active-card">
            {/* Animated rings */}
            <div className="callnow-pulse-rings">
              <div className={`callnow-ring ${callState === 'ringing' ? 'ringing' : callState === 'connected' ? 'connected' : 'ended'}`} />
              <div className={`callnow-ring ring-2 ${callState === 'ringing' ? 'ringing' : callState === 'connected' ? 'connected' : 'ended'}`} />
              <div className={`callnow-ring ring-3 ${callState === 'ringing' ? 'ringing' : callState === 'connected' ? 'connected' : 'ended'}`} />
              <div className="callnow-active-avatar">
                {callState === 'ended' ? (
                  <PhoneOff size={32} />
                ) : (
                  <Headphones size={32} />
                )}
              </div>
            </div>

            <h2 className="callnow-active-name">{selectedLine?.title || 'Customer Care'}</h2>
            <p className="callnow-active-number">{selectedLine?.number || CUSTOMER_CARE}</p>

            <div className={`callnow-active-status ${callState}`}>
              {callState === 'ringing' && (
                <>
                  <span className="callnow-status-dot ringing" />
                  Ringing...
                </>
              )}
              {callState === 'connected' && (
                <>
                  <span className="callnow-status-dot connected" />
                  Connected • {formatDuration(callDuration)}
                </>
              )}
              {callState === 'ended' && (
                <>
                  <CheckCircle size={14} />
                  Call Ended • {formatDuration(callDuration)}
                </>
              )}
            </div>

            {/* Call controls */}
            {callState !== 'ended' && (
              <div className="callnow-controls">
                <button
                  className={`callnow-control-btn ${isMuted ? 'active' : ''}`}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button
                  className={`callnow-control-btn ${isSpeaker ? 'active' : ''}`}
                  onClick={() => setIsSpeaker(!isSpeaker)}
                >
                  {isSpeaker ? <Volume2 size={22} /> : <VolumeX size={22} />}
                  <span>Speaker</span>
                </button>

                <button
                  className="callnow-control-btn"
                  onClick={() => setShowDialer(!showDialer)}
                >
                  <Hash size={22} />
                  <span>Keypad</span>
                </button>
              </div>
            )}

            {/* In-call dialer */}
            {showDialer && callState === 'connected' && (
              <div className="callnow-incall-dialer animate-fadeIn">
                {dialerInput && (
                  <div className="callnow-dialer-display">{dialerInput}</div>
                )}
                <div className="callnow-dialer-grid compact">
                  {dialerKeys.map((key) => (
                    <button
                      key={key}
                      className="callnow-dialer-key compact"
                      onClick={() => handleDialerKey(key)}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* End call button */}
            {callState !== 'ended' && (
              <button className="callnow-end-call-btn" onClick={endCall}>
                <PhoneOff size={24} />
              </button>
            )}

            {callState === 'ended' && (
              <div className="callnow-ended-actions animate-fadeIn">
                <button className="btn btn-primary" onClick={() => startCall(selectedLine)}>
                  <Phone size={16} /> Call Again
                </button>
                <button className="btn btn-secondary" style={{ color: 'var(--text-primary)' }} onClick={() => { setCallState('idle'); setSelectedLine(null); }}>
                  Back to Support Lines
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="callnow-page animate-fadeIn">
      <div className="callnow-layout">
        {/* Main content */}
        <div className="callnow-main">
          {/* Header */}
          <div className="callnow-header">
            <button
              className="callnow-back-btn"
              onClick={() => navigate('/support')}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="callnow-title">
                Call <span className="gradient-text">Customer Care</span>
              </h1>
              <p className="callnow-subtitle">Get instant help from our support team</p>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="callnow-hero-card">
            <div className="callnow-hero-glow" />
            <div className="callnow-hero-icon">
              <PhoneCall size={36} />
            </div>
            <h2>24/7 Customer Support</h2>
            <p className="callnow-hero-number">{CUSTOMER_CARE}</p>
            <p className="callnow-hero-desc">
              Our trained support agents are available round the clock to help you with rides, payments, safety, and more.
            </p>
            <div className="callnow-hero-stats">
              <div className="callnow-hero-stat">
                <Clock size={16} />
                <span>Avg. wait: 30s</span>
              </div>
              <div className="callnow-hero-stat">
                <Users size={16} />
                <span>50+ agents online</span>
              </div>
              <div className="callnow-hero-stat">
                <Globe size={16} />
                <span>Hindi & English</span>
              </div>
            </div>
            <a
              href={`tel:${CUSTOMER_CARE_RAW}`}
              className="callnow-call-btn"
              onClick={(e) => {
                e.preventDefault();
                startCall(supportLines[0]);
              }}
            >
              <Phone size={20} />
              Call Now — {CUSTOMER_CARE}
            </a>
          </div>

          {/* Support lines */}
          <div className="callnow-lines-section">
            <h3 className="callnow-section-title">
              <Headphones size={18} /> Dedicated Support Lines
            </h3>
            <div className="callnow-lines-grid">
              {supportLines.map((line, i) => (
                <div
                  className="callnow-line-card"
                  key={i}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="callnow-line-icon" style={{ color: line.color, background: `${line.color}15` }}>
                    {line.icon}
                  </div>
                  <div className="callnow-line-info">
                    <h4>{line.title}</h4>
                    <p className="callnow-line-number">{line.number}</p>
                    <div className="callnow-line-meta">
                      <span className="callnow-line-hours">
                        <Clock size={12} /> {line.hours}
                      </span>
                      <span className="callnow-line-wait">
                        Wait: {line.wait}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${line.number.replace(/-/g, '')}`}
                    className="callnow-line-call"
                    style={{ background: `${line.color}15`, color: line.color }}
                    onClick={(e) => {
                      e.preventDefault();
                      startCall(line);
                    }}
                  >
                    <Phone size={16} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Dialer */}
          <div className="callnow-dialer-section">
            <h3 className="callnow-section-title">
              <Hash size={18} /> Dial a Number
            </h3>
            <div className="callnow-dialer-card">
              <div className="callnow-dialer-display-main">
                {dialerInput || CUSTOMER_CARE}
              </div>
              <div className="callnow-dialer-grid">
                {dialerKeys.map((key) => (
                  <button
                    key={key}
                    className="callnow-dialer-key"
                    onClick={() => handleDialerKey(key)}
                  >
                    <span className="callnow-key-main">{key}</span>
                    {key >= '2' && key <= '9' && (
                      <span className="callnow-key-sub">
                        {key === '2' ? 'ABC' : key === '3' ? 'DEF' : key === '4' ? 'GHI' :
                         key === '5' ? 'JKL' : key === '6' ? 'MNO' : key === '7' ? 'PQRS' :
                         key === '8' ? 'TUV' : 'WXYZ'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="callnow-dialer-actions">
                {dialerInput && (
                  <button
                    className="callnow-dialer-backspace"
                    onClick={() => setDialerInput((prev) => prev.slice(0, -1))}
                  >
                    ⌫
                  </button>
                )}
                <a
                  href={`tel:${dialerInput || CUSTOMER_CARE_RAW}`}
                  className="callnow-dialer-call"
                  onClick={(e) => {
                    e.preventDefault();
                    startCall({ title: 'Customer Care', number: dialerInput || CUSTOMER_CARE, icon: <Phone size={20} />, color: '#10b981' });
                  }}
                >
                  <Phone size={20} />
                </a>
                {dialerInput && (
                  <button
                    className="callnow-dialer-clear"
                    onClick={() => setDialerInput('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="callnow-sidebar">
          {/* Current availability */}
          <div className="callnow-avail-card">
            <div className="callnow-avail-header">
              <span className="callnow-avail-dot" />
              <span>Lines Open</span>
            </div>
            <div className="callnow-avail-body">
              <div className="callnow-avail-stat">
                <span className="callnow-avail-value">50+</span>
                <span className="callnow-avail-label">Agents Online</span>
              </div>
              <div className="callnow-avail-stat">
                <span className="callnow-avail-value">~30s</span>
                <span className="callnow-avail-label">Avg. Wait Time</span>
              </div>
              <div className="callnow-avail-stat">
                <span className="callnow-avail-value">4.8★</span>
                <span className="callnow-avail-label">Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Office location */}
          <div className="callnow-office-card">
            <h4><MapPin size={16} /> Nearest Office</h4>
            <p className="callnow-office-name">HaloCab HQ — Bhagalpur</p>
            <p className="callnow-office-addr">MayaGanj, Bhagalpur, Bihar, India</p>
            <p className="callnow-office-time">
              <Clock size={14} /> Mon–Sat: 9 AM – 6 PM
            </p>
          </div>

          {/* Before you call tips */}
          <div className="callnow-tips-card">
            <h4><AlertCircle size={16} /> Before You Call</h4>
            <ul>
              {callTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* Other support */}
          <div className="callnow-alt-card">
            <h4>Other Ways to Reach Us</h4>
            <button className="callnow-alt-link" onClick={() => navigate('/support/chat')}>
              <div className="callnow-alt-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <PhoneForwarded size={16} />
              </div>
              <div>
                <span className="callnow-alt-title">Live Chat</span>
                <span className="callnow-alt-desc">Chat with agents</span>
              </div>
              <ChevronRight size={16} className="callnow-alt-arrow" />
            </button>
            <a href="mailto:support@halocab.com" className="callnow-alt-link">
              <div className="callnow-alt-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Globe size={16} />
              </div>
              <div>
                <span className="callnow-alt-title">Email Support</span>
                <span className="callnow-alt-desc">support@halocab.com</span>
              </div>
              <ChevronRight size={16} className="callnow-alt-arrow" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallNow;
