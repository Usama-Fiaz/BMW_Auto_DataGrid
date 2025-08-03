import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Alert,
  Snackbar,
  Stack,
  Button,
  Divider,
  Container,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import GridOnIcon from '@mui/icons-material/GridOn';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DataGridPage from './DataGridPage';
import CSVUpload from './CSVUpload';
import { useAuth } from '../context/AuthContext';

export default function DataManagementPage({ selectedGrid }) {
  const { token } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTab, setEditTab] = useState(0);
  const [gridName, setGridName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEditClick = () => {
    setGridName(selectedGrid.name);
    setEditDialogOpen(true);
  };

  const handleEditTabChange = (event, newValue) => {
    setEditTab(newValue);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditTab(0);
    setGridName('');
  };

  const handleUpdateGridName = async () => {
    if (!gridName.trim()) {
      setError('Grid name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:5001/api/grids/${selectedGrid.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: gridName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update grid name');
      }

      setSuccess('Grid name updated successfully');
      handleCloseEditDialog();
      // Trigger refresh to update the grid name in the UI
      window.location.reload();
    } catch (error) {
      setError(error.message || 'Failed to update grid name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (result) => {
    setSuccess(`Successfully uploaded ${result.recordsInserted || result.insertedCount || 0} records`);
    setRefreshTrigger(prev => prev + 1);
    handleCloseEditDialog();
  };

  const handleUploadError = (error) => {
    setError(error.error || 'Upload failed');
  };

  const handleError = (error) => {
    console.error('DataGrid error:', error);
    setError(error.message || 'An error occurred while loading data');
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 2, 
            color: 'primary.main',
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2.25rem' }
          }}
        >
          Universal Data Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            fontSize: '1.125rem',
            maxWidth: 1000
          }}
        >
          Upload any CSV file and view your data with automatic column detection and smart filtering.
        </Typography>
      </Box>

      {/* Grid Selection Indicator with Edit Button */}
      {selectedGrid && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Viewing data from:
              </Typography>
              <Chip 
                label={selectedGrid.name}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              disableRipple={true}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                backgroundColor: '#1976d2',
                color: 'white',
                border: '1px solid #1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  borderColor: '#1565c0',
                  color: 'white'
                }
              }}
            >
              Edit Grid
            </Button>
          </Stack>
        </Box>
      )}

      {/* Show message when no grid is selected */}
      {!selectedGrid && (
        <Card 
          elevation={0}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <GridOnIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 2
              }}
            >
              Select a Grid to View Data
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9,
                maxWidth: 500,
                mx: 'auto',
                mb: 3
              }}
            >
              Choose a grid from the "My Grids" tab to view and manage its data. 
              Each grid can contain different types of data with unique column structures.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to My Grids
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show data grid only when a grid is selected */}
      {selectedGrid && (
        <Box>
          <DataGridPage 
            key={refreshTrigger} 
            onError={handleError}
            selectedGrid={selectedGrid}
          />
        </Box>
      )}

      {/* Edit Grid Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Edit Grid: {selectedGrid?.name}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Tabs 
            value={editTab} 
            onChange={handleEditTabChange}
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 48,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiTabs-indicator': {
                height: 2,
                borderRadius: '2px 2px 0 0',
              },
            }}
          >
            <Tab 
              label="Edit Name" 
              icon={<EditIcon />} 
              iconPosition="start"
              sx={{
                '& .MuiTab-iconWrapper': {
                  mr: 1,
                },
              }}
            />
            <Tab 
              label="Replace CSV" 
              icon={<UploadFileIcon />} 
              iconPosition="start"
              sx={{
                '& .MuiTab-iconWrapper': {
                  mr: 1,
                },
              }}
            />
          </Tabs>

          {editTab === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Update the name of your grid. This will be displayed in the grid list and data management page.
              </Typography>
              <TextField
                fullWidth
                label="Grid Name"
                value={gridName}
                onChange={(e) => setGridName(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {editTab === 1 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Warning: Replacing the CSV file will delete all existing data in this grid and replace it with the new CSV file.
                </Typography>
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a new CSV file to replace all data in this grid. The existing data will be permanently deleted.
              </Typography>
              <CSVUpload 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                selectedGrid={selectedGrid}
                isReplacement={true}
              />
            </Box>
          )}
        </DialogContent>

        {editTab === 0 && (
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleCloseEditDialog}
              variant="outlined"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateGridName}
              variant="contained"
              disabled={isLoading || !gridName.trim()}
              sx={{ minWidth: 100 }}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSuccess} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
} 