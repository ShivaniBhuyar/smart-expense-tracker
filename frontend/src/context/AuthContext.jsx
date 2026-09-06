import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('jwtToken') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      setToken(data.token);
      setUser({ id: data.id, email: data.email, fullName: data.fullName, role: data.role });
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, fullName: data.fullName, role: data.role }));
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      const { data } = response.data;
      setToken(data.token);
      setUser({ id: data.id, email: data.email, fullName: data.fullName, role: data.role });
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, fullName: data.fullName, role: data.role }));
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.validationErrors?.fullName || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
