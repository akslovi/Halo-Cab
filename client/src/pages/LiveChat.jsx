import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Paperclip, Smile, MoreVertical, Phone, Video,
  Bot, User, Clock, CheckCheck, Image, X, ChevronDown,
  Headphones, Shield, Star, MessageCircle, Zap, HelpCircle
} from 'lucide-react';

const AGENT = {
  name: 'Priya',
  role: 'Support Agent',
  avatar: '👩‍💼',
  status: 'online',
};

const quickReplies = [
  'I need help with a ride',
  'Payment issue',
  'Report a driver',
  'Account problem',
  'Refund request',
  'Other issue',
];

const agentResponses = {
  'i need help with a ride': [
    "I'd be happy to help with your ride! Could you tell me more about the issue?",
    "Are you facing a problem with a current ride, a past ride, or do you need help booking a new one?",
  ],
  'payment issue': [
    "I understand you're having a payment issue. Let me look into this for you.",
    "Could you share the ride ID or the date of the transaction? I'll check the payment status right away.",
  ],
  'report a driver': [
    "I'm sorry to hear about your experience. Your safety is our top priority.",
    "Could you share the ride details and describe what happened? I'll escalate this to our safety team immediately.",
  ],
  'account problem': [
    "Let me help you with your account issue!",
    "What kind of problem are you experiencing? Login issues, profile updates, or something else?",
  ],
  'refund request': [
    "I'll help you with your refund request.",
    "Could you provide the ride ID and the reason for the refund? Refunds are typically processed within 3-5 business days.",
  ],
  'other issue': [
    "Of course! I'm here to help with anything.",
    "Please describe your issue in detail and I'll do my best to assist you.",
  ],
};

const defaultResponses = [
  "Thank you for sharing that. Let me look into this for you.",
  "I understand your concern. Let me check our system for more details.",
  "That's a great question! Here's what I can tell you...",
  "I appreciate your patience. I'm working on resolving this right away.",
  "Let me connect you with a specialist who can help better with this specific issue.",
];

const initialMessages = [
  {
    id: 1,
    sender: 'agent',
    text: `Hi there! 👋 I'm ${AGENT.name}, your HaloCab support assistant. How can I help you today?`,
    time: new Date(Date.now() - 60000),
    status: 'read',
  },
];

const LiveChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showEmojiHint, setShowEmojiHint] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [chatRating, setChatRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getAgentResponse = (userMsg) => {
    const lower = userMsg.toLowerCase().trim();
    for (const [key, responses] of Object.entries(agentResponses)) {
      if (lower.includes(key) || key.includes(lower)) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = (text) => {
    if (!text.trim() && !attachedFile) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date(),
      status: 'sent',
      attachment: attachedFile,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFile(null);
    setShowQuickReplies(false);

    // Simulate "sent" -> "delivered" -> "read"
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'delivered' } : m))
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'read' } : m))
      );
    }, 1000);

    // Agent typing + response
    setTimeout(() => setIsTyping(true), 1200);

    const responseDelay = 2000 + Math.random() * 2000;
    setTimeout(() => {
      setIsTyping(false);
      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: getAgentResponse(text),
        time: new Date(),
        status: 'read',
      };
      setMessages((prev) => [...prev, agentMsg]);

      // Show rating after 6 messages
      if (messages.length >= 5 && !showRating) {
        setTimeout(() => setShowRating(true), 2000);
      }
    }, responseDelay);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const emojis = ['😊', '😢', '😡', '🙏', '👍', '❤️', '😂', '🤔'];

  return (
    <div className="livechat-page animate-fadeIn">
      {/* Chat Container */}
      <div className="livechat-container">
        {/* Header */}
        <div className="livechat-header">
          <div className="livechat-header-left">
            <button
              className="livechat-back-btn"
              onClick={() => navigate('/support')}
              aria-label="Back to support"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="livechat-agent-info">
              <div className="livechat-agent-avatar">
                <span>{AGENT.avatar}</span>
                <span className="livechat-status-dot" />
              </div>
              <div>
                <h3 className="livechat-agent-name">{AGENT.name}</h3>
                <span className="livechat-agent-status">
                  {isTyping ? 'Typing...' : 'Online'}
                </span>
              </div>
            </div>
          </div>
          <div className="livechat-header-actions">
            <button className="livechat-action-btn" title="Voice Call">
              <Phone size={18} />
            </button>
            <button className="livechat-action-btn" title="Video Call">
              <Video size={18} />
            </button>
            <button className="livechat-action-btn" title="More Options">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="livechat-messages"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {/* Date separator */}
          <div className="livechat-date-separator">
            <span>Today</span>
          </div>

          {/* Encryption notice */}
          <div className="livechat-encryption-notice">
            <Shield size={14} />
            <span>Messages are end-to-end encrypted. Your privacy is protected.</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`livechat-message ${msg.sender === 'user' ? 'user' : 'agent'}`}
            >
              {msg.sender === 'agent' && (
                <div className="livechat-msg-avatar">{AGENT.avatar}</div>
              )}
              <div className="livechat-msg-bubble">
                {msg.attachment && (
                  <div className="livechat-msg-attachment">
                    <Image size={16} />
                    <span>{msg.attachment.name}</span>
                    <span className="livechat-msg-filesize">{msg.attachment.size}</span>
                  </div>
                )}
                <p className="livechat-msg-text">{msg.text}</p>
                <div className="livechat-msg-meta">
                  <span className="livechat-msg-time">{formatTime(msg.time)}</span>
                  {msg.sender === 'user' && (
                    <span className={`livechat-msg-status ${msg.status}`}>
                      <CheckCheck size={14} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="livechat-message agent">
              <div className="livechat-msg-avatar">{AGENT.avatar}</div>
              <div className="livechat-msg-bubble livechat-typing-bubble">
                <div className="livechat-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          {/* Quick Replies */}
          {showQuickReplies && (
            <div className="livechat-quick-replies">
              <p className="livechat-quick-label">
                <Zap size={14} /> Quick replies
              </p>
              <div className="livechat-quick-chips">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    className="livechat-quick-chip"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          {showRating && (
            <div className="livechat-rating-card animate-fadeIn">
              <p className="livechat-rating-label">How's your experience?</p>
              <div className="livechat-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`livechat-star-btn ${chatRating >= star ? 'active' : ''}`}
                    onClick={() => {
                      setChatRating(star);
                      setTimeout(() => setShowRating(false), 1500);
                    }}
                  >
                    <Star size={24} fill={chatRating >= star ? '#f59e0b' : 'none'} />
                  </button>
                ))}
              </div>
              {chatRating > 0 && (
                <p className="livechat-rating-thanks animate-fadeIn">
                  Thank you for your feedback! ✨
                </p>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button
            className="livechat-scroll-btn"
            onClick={() => scrollToBottom()}
          >
            <ChevronDown size={20} />
          </button>
        )}

        {/* Attachment preview */}
        {attachedFile && (
          <div className="livechat-attachment-preview">
            <div className="livechat-attachment-info">
              <Paperclip size={16} />
              <span>{attachedFile.name}</span>
              <span className="livechat-attachment-size">{attachedFile.size}</span>
            </div>
            <button
              className="livechat-attachment-remove"
              onClick={() => setAttachedFile(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Emoji picker hint */}
        {showEmojiHint && (
          <div className="livechat-emoji-tray animate-fadeIn">
            {emojis.map((emoji, i) => (
              <button
                key={i}
                className="livechat-emoji-btn"
                onClick={() => {
                  setInput((prev) => prev + emoji);
                  setShowEmojiHint(false);
                  inputRef.current?.focus();
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className="livechat-input-bar" onSubmit={handleSubmit}>
          <button
            type="button"
            className="livechat-input-action"
            onClick={() => setShowEmojiHint(!showEmojiHint)}
            title="Emoji"
          >
            <Smile size={20} />
          </button>
          <button
            type="button"
            className="livechat-input-action"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx"
          />
          <input
            ref={inputRef}
            type="text"
            className="livechat-input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            type="submit"
            className={`livechat-send-btn ${input.trim() || attachedFile ? 'active' : ''}`}
            disabled={!input.trim() && !attachedFile}
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Sidebar */}
      <div className="livechat-sidebar">
        <div className="livechat-sidebar-header">
          <MessageCircle size={20} />
          <h3>Chat Info</h3>
        </div>

        {/* Agent Card */}
        <div className="livechat-sidebar-agent">
          <div className="livechat-sidebar-avatar">{AGENT.avatar}</div>
          <h4>{AGENT.name}</h4>
          <span className="livechat-sidebar-role">{AGENT.role}</span>
          <div className="livechat-sidebar-rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} fill={s <= 4 ? '#f59e0b' : 'none'} color="#f59e0b" />
            ))}
            <span>4.8</span>
          </div>
        </div>

        {/* Info Items */}
        <div className="livechat-sidebar-info">
          <div className="livechat-sidebar-item">
            <Clock size={16} />
            <div>
              <span className="livechat-sidebar-label">Avg. Response Time</span>
              <span className="livechat-sidebar-value">~30 seconds</span>
            </div>
          </div>
          <div className="livechat-sidebar-item">
            <Headphones size={16} />
            <div>
              <span className="livechat-sidebar-label">Specialty</span>
              <span className="livechat-sidebar-value">Rides & Payments</span>
            </div>
          </div>
          <div className="livechat-sidebar-item">
            <Shield size={16} />
            <div>
              <span className="livechat-sidebar-label">Verified Agent</span>
              <span className="livechat-sidebar-value livechat-verified">✓ Verified</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="livechat-sidebar-tips">
          <h4><HelpCircle size={16} /> Tips</h4>
          <ul>
            <li>Have your ride ID ready for faster help</li>
            <li>You can attach screenshots of issues</li>
            <li>Our agents are available 24/7</li>
            <li>Use quick replies for common topics</li>
          </ul>
        </div>

        {/* End Chat */}
        <button
          className="livechat-end-btn"
          onClick={() => navigate('/support')}
        >
          End Chat
        </button>
      </div>
    </div>
  );
};

export default LiveChat;
