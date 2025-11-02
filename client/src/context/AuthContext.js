import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data.user);
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success('Login successful!');
      return data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/api/auth/update-profile', profileData);
      setUser(data.user);
      toast.success('Profile updated successfully');
      return data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/update-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateProfile,
    updatePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

