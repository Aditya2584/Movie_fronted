import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user info exist in localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/signin', { email, password });
      const { data } = response.data; // contains email, role, status, token
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        role: data.role,
        status: data.status
      }));

      setToken(data.token);
      setUser({
        email: data.email,
        role: data.role,
        status: data.status
      });

      return { success: true, user: data };
    } catch (error) {
      const errMsg = error.response?.data?.err || 'Failed to login';
      return { success: false, error: errMsg };
    }
  };

  const signup = async (name, email, password, role = 'CUSTOMER') => {
    try {
      // Validate role name matching schema (CUSTOMER, ADMIN, CLIENT)
      const response = await API.post('/auth/signup', {
        name,
        email,
        password,
        userRole: role
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errMsg = error.response?.data?.err || 'Registration failed';
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      await API.patch('/auth/reset', { oldPassword, newPassword });
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.err || 'Password reset failed';
      return { success: false, error: errMsg };
    }
  };

  const isAdmin = user && user.role === 'ADMIN';
  const isClient = user && user.role === 'CLIENT';
  const isCustomer = user && user.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updatePassword,
        isAdmin,
        isClient,
        isCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
