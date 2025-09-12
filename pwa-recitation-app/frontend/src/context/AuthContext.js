import React, { createContext, useState, useContext, useEffect } from 'react';
import { setAuthToken } from '../services/api';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
      
      // If no token exists, get a demo token for development
      try {
        const response = await api.post('/auth/demo-token');
        const { token: demoToken, user: demoUser } = response.data;
        localStorage.setItem('token', demoToken);
        setAuthToken(demoToken);
        setIsAuthenticated(true);
        setUser(demoUser);
      } catch (error) {
        console.error('Failed to get demo token:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
