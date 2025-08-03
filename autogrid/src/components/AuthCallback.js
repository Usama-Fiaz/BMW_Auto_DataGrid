import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import jwt_decode from 'jwt-decode';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('authToken', token);
      
      // Decode the token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          picture: 'https://via.placeholder.com/150'
        };
        
        // Store user data in localStorage for immediate access
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirect to the main dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Token decode failed:', error);
        navigate('/login');
      }
    } else {
      // No token received, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing authentication...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we set up your personal dashboard.
      </Typography>
    </Box>
  );
};

export default AuthCallback; 