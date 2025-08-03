import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Container,
  TextField,
  Divider,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Grid,
  Card,
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Google as GoogleIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { auth, provider, signInWithPopup } from '../firebase';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleFirebaseLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      console.log("ID Token:", idToken);
      console.log("User data:", user);
      
      // Create user data object
      const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName || 'Google User'
      };

      // Call backend to create/verify user in database
      const response = await fetch('http://localhost:5001/api/auth/firebase/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: idToken,
          userData: userData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Firebase authentication failed');
      }

      // Store user data and token
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);
      
      setSuccess('Sign-in successful! Redirecting...');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async () => {
    setLoading(true);
    setError('');

    try {
      // Enhanced validation
      if (isRegistering) {
        // Registration validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          setError('All fields are required');
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          return;
        }

        // Password validation
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
      } else {
        // Login validation
        if (!formData.email || !formData.password) {
          setError('Email and password are required');
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          return;
        }
      }

      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegistering 
        ? { name: formData.name, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword }
        : { email: formData.email, password: formData.password };

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store user data and token
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);
      
      setSuccess(`${isRegistering ? 'Registration' : 'Login'} successful!`);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };



  return (
      <Box
        sx={{
          minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
        alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
      <Container maxWidth="md">
        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <Card
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 500,
              mx: 'auto',
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                p: 4,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  opacity: 0.3,
                }
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  background: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                <img src="/bmwIcon.png" alt="BMW" style={{ width: 80, height: 80 }} />
              </Avatar>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2.25rem' },
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  mb: 1
                }}
              >
                BMW DataGrid
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                {isRegistering ? 'Create your account' : 'Welcome back'}
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Error/Success Alerts */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                    border: '1px solid #ef5350',
                    '& .MuiAlert-icon': {
                      color: '#d32f2f',
                    },
                    '& .MuiAlert-message': {
                      color: '#c62828',
                      fontWeight: 500,
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                    border: '1px solid #66bb6a',
                    '& .MuiAlert-icon': {
                      color: '#2e7d32',
                    },
                    '& .MuiAlert-message': {
                      color: '#1b5e20',
                      fontWeight: 500,
                    }
                  }}
                >
                  {success}
                </Alert>
              )}

              {/* Manual Authentication Form */}
              <Fade in={true} style={{ transitionDelay: '400ms' }}>
                <Box component="form" onSubmit={handleManualAuth} sx={{ mb: 3 }}>
                  {isRegistering && (
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            }
                          },
                        }
                      }}
                    />
                  )}

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          }
                        },
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'text.secondary' }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          }
                        },
                      }
                    }}
                  />

                  {isRegistering && (
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        margin="normal"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            }
                          },
                        }
                      }}
                      />
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      color: 'white !important',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                        color: 'white !important',
                        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: 'white !important',
                        opacity: 0.6,
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      isRegistering ? 'Create Account' : 'Sign In'
                    )}
                  </Button>

                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setIsRegistering(!isRegistering)}
                    sx={{ 
                      mb: 2,
                      color: '#1976d2 !important',
                      fontWeight: 500,
                      '&:hover': {
                        background: 'rgba(25, 118, 210, 0.04)',
                        color: '#1565c0 !important',
                      }
                    }}
                  >
                    {isRegistering 
                      ? 'Already have an account? Sign In' 
                      : "Don't have an account? Register"
                    }
                  </Button>
                </Box>
              </Fade>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Divider sx={{ flex: 1, borderColor: 'grey.300' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    px: 2, 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  OR
                </Typography>
                <Divider sx={{ flex: 1, borderColor: 'grey.300' }} />
              </Box>

              {/* Google Sign-in */}
              <Fade in={true} style={{ transitionDelay: '600ms' }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleFirebaseLogin}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
                  sx={{
                    py: 1.5,
                    mb: 2,
                    borderRadius: 2,
                    borderColor: '#4285f4',
                    color: '#4285f4 !important',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#357abd',
                      backgroundColor: 'rgba(66, 133, 244, 0.04)',
                      color: '#357abd !important',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      borderColor: '#4285f4',
                      color: '#4285f4 !important',
                      opacity: 0.6,
                    }
                  }}
                >
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </Button>
              </Fade>


            </CardContent>
          </Card>
        </Zoom>
      </Container>
      </Box>
  );
};

export default LoginPage; 