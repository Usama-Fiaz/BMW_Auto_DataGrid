import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      // Check for both authToken (JWT) and firebaseToken
      const storedToken = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken');
      const storedUserData = localStorage.getItem('userData');
      
      if (storedToken && storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
          setToken(storedToken);
          console.log('✅ Authentication restored from localStorage:', userData);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('authToken');
          localStorage.removeItem('firebaseToken');
          localStorage.removeItem('userData');
          setToken(null);
          setUser(null);
        }
      } else {
        // No valid authentication found
        setToken(null);
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      // Call logout endpoint to update user status
      if (token) {
        await fetch('http://localhost:5001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('userData');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 