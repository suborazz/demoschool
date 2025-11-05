import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

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
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Initialize auth - only run once on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔄 Initializing auth...');
    console.log('Stored token:', storedToken ? 'Found' : 'Not found');
    console.log('Stored user:', storedUser ? 'Found' : 'Not found');
    
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // Try to use cached user first for instant load
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('✅ User loaded from cache:', parsedUser.email);
        } catch (e) {
          console.warn('Failed to parse cached user');
        }
      }
      
      // Then verify with server
      await loadUser(storedToken);
    } else {
      setLoading(false);
    }
  };

  const loadUser = async (tokenToUse = null) => {
    const authToken = tokenToUse || token;
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      setUser(data.user);
      // Cache user data for faster subsequent loads
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ User verified:', data.user.email, 'Role:', data.user.role);
    } catch (error) {
      console.error('Load user error:', error.response?.status, error.response?.data?.message);
      
      // Only logout if it's actually an auth error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🔴 Authentication failed, clearing session...');
        performLogout(false); // Silent logout without toast
      }
    } finally {
      setLoading(false);
    }
  };

  const performLogout = (showToast = true) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    
    if (showToast) {
      toast.success('Logged out successfully');
    }
    
    // Only redirect if on protected page
    const isProtectedPage = router.pathname.includes('/admin') || 
                           router.pathname.includes('/staff') || 
                           router.pathname.includes('/student') || 
                           router.pathname.includes('/parent');
    
    if (isProtectedPage) {
      router.push('/login');
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔑 Attempting login for:', email);
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      // Store both token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setToken(data.token);
      setUser(data.user);
      
      console.log('✅ Login successful:', data.user.email, 'Role:', data.user.role);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'staff') {
        router.push('/staff/dashboard');
      } else if (data.user.role === 'parent') {
        router.push('/parent/dashboard');
      } else if (data.user.role === 'student') {
        router.push('/student/dashboard');
      }
      
      return data.user;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    performLogout(true);
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/api/auth/update-profile', profileData);
      setUser(data.user);
      // Update cached user
      localStorage.setItem('user', JSON.stringify(data.user));
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

