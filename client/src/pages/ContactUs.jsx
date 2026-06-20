import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const contactInfo = [
  {
    icon: <MapPin size={24} />,
    title: 'Visit Us',
    lines: ['MayaGanj, Bhagalpur', 'Bihar, India - 812001'],
  },
  {
    icon: <Phone size={24} />,
    title: 'Call Us',
    lines: ['+91-8271234568', '+91-9876543210'],
  },
  {
    icon: <Mail size={24} />,
    title: 'Email Us',
    lines: ['info@halogrid.in', 'support@halocab.com'],
  },
  {
    icon: <Clock size={24} />,
    title: 'Working Hours',
    lines: ['Mon - Sat: 9:00 AM - 9:00 PM', 'Sunday: 10:00 AM - 6:00 PM'],
  },
];

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="info-page animate-fadeIn">
      {/* Hero */}
      <section className="info-hero">
        <div className="info-hero-glow"></div>
        <h1 className="info-hero-title">Contact <span className="gradient-text">Us</span></h1>
        <p className="info-hero-subtitle">
          Have a question, feedback, or partnership inquiry? We'd love to hear from you.
        </p>
      </section>

      {/* Contact Cards */}
      <section className="info-contact-grid">
        {contactInfo.map((item, i) => (
          <div className="info-contact-card" key={i} style={{ animationDelay: `${i * 80}ms` }}>
            <div className="info-contact-icon">{item.icon}</div>
            <h3 className="info-contact-title">{item.title}</h3>
            {item.lines.map((line, j) => (
              <p className="info-contact-line" key={j}>{line}</p>
            ))}
          </div>
        ))}
      </section>

      {/* Contact Form + Map */}
      <section className="info-section">
        <div className="info-contact-layout">
          {/* Form */}
          <div className="info-form-card">
            <div className="info-form-header">
              <MessageSquare size={24} className="gradient-text" />
              <h2 className="info-form-title">Send Us a Message</h2>
            </div>
            <form onSubmit={handleSubmit} className="info-form">
              <div className="info-form-row">
                <div className="info-form-group">
                  <label className="info-form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="info-form-input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="info-form-group">
                  <label className="info-form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="info-form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="info-form-row">
                <div className="info-form-group">
                  <label className="info-form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="info-form-input"
                    placeholder="+91-XXXXXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="info-form-group">
                  <label className="info-form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="info-form-input"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="info-form-group">
                <label className="info-form-label">Message</label>
                <textarea
                  name="message"
                  className="info-form-input info-form-textarea"
                  placeholder="Write your message here..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg info-form-submit" disabled={loading}>
                {loading ? (
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map */}
          <div className="info-map-card">
            <h3 className="info-map-title">Find Us Here</h3>
            <div className="info-map-container">
              <iframe
                title="HaloCab Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3616.5!2d86.98!3d25.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDE1JzAwLjAiTiA4NsKwNTgnNDguMCJF!5e0!3m2!1sen!2sin!4v1600000000000"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
