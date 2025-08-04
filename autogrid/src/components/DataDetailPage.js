import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';

const DataDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [gridName, setGridName] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5001/api/data/${id}`, {
          headers
        });

        if (!response.ok) {
          throw new Error('Record not found');
        }

        const result = await response.json();
        setData(result);

        if (result.grid_id) {
          try {
            const gridResponse = await fetch(`http://localhost:5001/api/grids/${result.grid_id}`, {
              headers
            });
            if (gridResponse.ok) {
              const gridData = await gridResponse.json();
              setGridName(gridData.grid.name);
            }
          } catch (err) {
          }
        }

        try {
          const userResponse = await fetch(`http://localhost:5001/api/auth/users/${result.added_by}`, {
            headers
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserName(userData.user.name || userData.user.email);
          } else {
            setUserName(result.added_by.substring(0, 8) + '...');
          }
        } catch (err) {
          setUserName(result.added_by.substring(0, 8) + '...');
        }

      } catch (err) {
        setError(err.message || 'Failed to load record details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, token]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No data found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const jsonData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{
          borderRadius: 2,
          background: 'white',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ 
                borderRadius: 2,
                backgroundColor: '#1976d2',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '10px 20px',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Back
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Record Details
            </Typography>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Metadata */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Record Information
                  </Typography>
                  <Grid container spacing={3}>
                  {data.grid_id && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Grid
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {gridName || 'Loading...'}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Added By
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {userName || 'Loading...'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Created At
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(data.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Data Fields */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Data Fields
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(jsonData).map(([key, value]) => (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <Box
                          sx={{
                            p: 2.5,
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: 3,
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            height: '100%',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              borderColor: 'rgba(25, 118, 210, 0.2)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                            }
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            color="primary"
                            sx={{ 
                              mb: 1,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              wordBreak: 'break-word',
                              color: 'text.primary',
                              fontSize: '1rem',
                              lineHeight: 1.4
                            }}
                          >
                            {value === null || value === undefined ? (
                              <Box component="span" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                Not available
                              </Box>
                            ) : (
                              String(value)
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default DataDetailPage; 