import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Phone, Car, Key, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const Login = () => {
  const location = useLocation();
  const initialRole = location.state?.role || 'user'; // 'user', 'driver', 'admin'

  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    role: initialRole,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '', otp: '', role: initialRole });
    setOtpSent(false);
  };

  const handleSendOtp = async () => {
    if (!form.phone) {
      toast.error('Please enter a phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.sendOtp(form.phone);
      setOtpSent(true);
      toast.success(res.data.message || 'OTP Sent!');
      if (res.data.otp) {
        toast('Test OTP: ' + res.data.otp, { icon: '🧪' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        if (loginMethod === 'otp') {
          const user = await loginWithOtp(form.phone, form.otp);
          toast.success(`Welcome back, ${user.name}!`);
          navigateByRole(user.role);
        } else {
          const user = await login(form.email, form.password);
          toast.success(`Welcome back, ${user.name}!`);
          navigateByRole(user.role);
        }
      } else {
        if (form.password !== form.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        const user = await register(form);
        toast.success('Account created successfully!');
        navigateByRole(user.role);
      }
    } catch (err) {
      const message = err.response?.data?.message
        || err.response?.data?.errors?.[0]?.message
        || err.message
        || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const navigateByRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'driver') navigate('/driver');
    else navigate('/book');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="auth-card animate-fadeIn" style={{ margin: 'auto', position: 'relative', width: '100%', maxWidth: '450px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-ghost"
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          aria-label="Close login page"
        >
          <X size={20} />
        </button>
        <div className="auth-logo">
          <h1>
            {initialRole === 'driver' ? (isLogin ? 'Captain Login' : 'Captain Registration') :
             initialRole === 'admin' ? (isLogin ? 'Admin Login' : 'Admin Registration') :
             (isLogin ? 'User Login' : 'User Registration')}
          </h1>
          <p>Your premium ride, one tap away</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); resetForm(); }}
            id="login-tab"
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); resetForm(); }}
            id="register-tab"
          >
            Register
          </button>
        </div>

        {isLogin && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              className={`btn btn-sm ${loginMethod === 'password' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setLoginMethod('password'); setOtpSent(false); setForm(f => ({ ...f, otp: '' })); }}
            >
              Email & Password
            </button>
            <button
              type="button"
              className={`btn btn-sm ${loginMethod === 'otp' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setLoginMethod('otp'); setForm(f => ({ ...f, otp: '' })); }}
            >
              Phone & OTP
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-icon">
                  <User size={16} className="icon" />
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    required={!isLogin}
                    id="register-name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="form-input-icon">
                  <Phone size={16} className="icon" />
                  <input
                    type="tel"
                    className="form-input"
                    name="phone"
                    placeholder="Enter Mobile Number"
                    value={form.phone}
                    onChange={handleChange}
                    required={!isLogin}
                    id="register-phone"
                  />
                </div>
              </div>

            </>
          )}

          {(isLogin && loginMethod === 'otp') ? (
            <>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="form-input-icon">
                  <Phone size={16} className="icon" />
                  <input
                    type="tel"
                    className="form-input"
                    name="phone"
                    placeholder="Enter Mobile Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    disabled={otpSent}
                  />
                </div>
              </div>

              {otpSent && (
                <div className="form-group animate-fadeIn">
                  <label className="form-label">Enter OTP</label>
                  <div className="form-input-icon">
                    <Key size={16} className="icon" />
                    <input
                      type="text"
                      className="form-input"
                      name="otp"
                      placeholder="e.g., 1234"
                      value={form.otp}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {!otpSent ? (
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-full"
                  disabled={loading}
                  onClick={handleSendOtp}
                >
                  {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Send OTP'}
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={loading}
                >
                  {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Verify & Login'}
                </button>
              )}
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="form-input-icon">
                  <Mail size={16} className="icon" />
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    id="input-email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-icon">
                  <Lock size={16} className="icon" />
                  <input
                    type="password"
                    className="form-input"
                    name="password"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    id="input-password"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="form-group animate-fadeIn">
                  <label className="form-label">Confirm Password</label>
                  <div className="form-input-icon">
                    <Lock size={16} className="icon" />
                    <input
                      type="password"
                      className="form-input"
                      name="confirmPassword"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                      id="input-confirm-password"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
                id="auth-submit-btn"
              >
                {loading ? (
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </>
          )}

        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>Demo: <strong>rahul@test.com</strong> / password123</p>
          ) : (
            <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); resetForm(); }}>Sign in</a></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
