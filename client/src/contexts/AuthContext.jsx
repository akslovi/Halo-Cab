import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('halocab_token'));

  const fetchUser = useCallback(async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await authAPI.getMe();
      setUser(data.data.user);
      setDriverProfile(data.data.driverProfile);
    } catch (err) {
      console.error('Auth fetch error:', err);
      localStorage.removeItem('halocab_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const { user: u, token: t, driverProfile: dp } = data.data;
    localStorage.setItem('halocab_token', t);
    setToken(t);
    setUser(u);
    setDriverProfile(dp);
    return u;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    const { user: u, token: t } = data.data;
    localStorage.setItem('halocab_token', t);
    setToken(t);
    setUser(u);
    return u;
  };

  const loginWithOtp = async (phone, otp) => {
    const { data } = await authAPI.verifyOtp(phone, otp);
    const { user: u, token: t, driverProfile: dp } = data.data;
    localStorage.setItem('halocab_token', t);
    setToken(t);
    setUser(u);
    if (dp) setDriverProfile(dp);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('halocab_token');
    setToken(null);
    setUser(null);
    setDriverProfile(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        driverProfile,
        loading,
        token,
        login,
        register,
        loginWithOtp,
        logout,
        updateUser,
        setDriverProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDriver: user?.role === 'driver',
        isUser: user?.role === 'user',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
