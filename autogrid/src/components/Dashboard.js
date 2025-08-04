import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Stack,
  Divider,
  Alert,
  Container,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DataGridPage from './DataGridPage';
import DataManagementPage from './DataManagementPage';
import GridManagement from './GridManagement';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGrid, setSelectedGrid] = useState(null);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 1 && !selectedGrid) {
      return;
    }
    setActiveTab(newValue);
    setSelectedGrid(null);
  };

  const handleGridSelect = (grid) => {
    setSelectedGrid(grid);
    setActiveTab(1);
  };



  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          background: 'white',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ 
                bgcolor: 'white',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <img src="/bmwIcon.png" alt="BMW" style={{ width: 40, height: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Welcome back, {user?.name || user?.email}
                </Typography>
              </Box>
            </Stack>
                               <Stack direction="row" spacing={1}>
                     <Tooltip title="Logout">
                       <IconButton size="small" onClick={handleLogout}>
                         <LogoutIcon />
                       </IconButton>
                     </Tooltip>
                   </Stack>
          </Stack>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              }
            }}
          >
            <Tab label="My Grids" />
            <Tab 
              label="Data Management" 
              disabled={!selectedGrid}
              sx={{
                opacity: selectedGrid ? 1 : 0.5,
                cursor: selectedGrid ? 'pointer' : 'not-allowed',
              }}
            />
          </Tabs>
        </Box>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
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
          <GridManagement onGridSelect={handleGridSelect} />
        </Paper>
      )}
      {activeTab === 1 && (
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
          <DataManagementPage selectedGrid={selectedGrid} />
        </Paper>
      )}


    </Container>
  );
};

export default Dashboard; 