import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  GridOn as GridIcon,
  Upload as UploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const GridManagement = ({ onGridSelect }) => {
  const { token } = useAuth();
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGrid, setSelectedGrid] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    csvFile: null
  });
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch user's grids
  const fetchGrids = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/grids', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch grids');
      }

      const data = await response.json();
      setGrids(data.grids || []);
    } catch (err) {
      setError('Failed to load grids');
      console.error('Error fetching grids:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGrids();
  }, [fetchGrids]);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setFormData(prev => ({ ...prev, csvFile: file }));
    } else {
      setError('Please select a valid CSV file');
    }
  };

  // Create new grid
  const handleCreateGrid = async () => {
    if (!formData.name.trim() || !formData.csvFile) {
      setError('Please provide a grid name and select a CSV file');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('csvFile', formData.csvFile);

      const response = await fetch('http://localhost:5001/api/grids/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create grid');
      }

      const result = await response.json();
      
      // Refresh grids list
      await fetchGrids();
      
      // Close dialog and reset form
      setCreateDialogOpen(false);
              setFormData({ name: '', csvFile: null });
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Grid created successfully! ${result.recordsInserted} records imported.`,
        severity: 'success'
      });
      
    } catch (err) {
      setError(err.message || 'Failed to create grid');
    } finally {
      setUploading(false);
    }
  };

  // Delete grid
  const handleDeleteGrid = async () => {
    if (!selectedGrid) return;

    try {
      const response = await fetch(`http://localhost:5001/api/grids/${selectedGrid.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete grid');
      }

      // Refresh grids list
      await fetchGrids();
      setDeleteDialogOpen(false);
      setSelectedGrid(null);
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Grid "${selectedGrid.name}" deleted successfully`,
        severity: 'success'
      });
      
    } catch (err) {
      setError('Failed to delete grid');
      console.error('Error deleting grid:', err);
    }
  };

  // Select grid
  const handleGridSelect = (grid) => {
    onGridSelect(grid);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          My Data Grids
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Create New Grid
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {grids.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', background: 'rgba(248, 250, 252, 0.8)' }}>
          <GridIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No grids created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first data grid by uploading a CSV file
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 2, color: '#000000 !important' ,'&:hover': {
      color: '#000000 !important',
      borderColor: '#000000', // Optional: keep border black on hover
      backgroundColor: '#f5f5f5', // Optional: subtle hover background
    },}}
          >
            Create Your First Grid
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {grids.map((grid) => (
            <Grid item xs={12} sm={6} md={4} key={grid.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onClick={() => handleGridSelect(grid)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {grid.name.charAt(0).toUpperCase() + grid.name.slice(1).toLowerCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Created {new Date(grid.created_at).toLocaleDateString()}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip 
                          label={`${grid.record_count} records`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />

                      </Stack>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGrid(grid);
                        setDeleteDialogOpen(true);
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Grid Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create New Data Grid
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Grid Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              placeholder="Enter a name for your grid"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            

            
            <Box>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-file-input"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="csv-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    py: 2,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: '#0d47a1 !important',
                    backgroundColor: 'rgba(13, 71, 161, 0.04) !important',
                    color: '#000000 !important',
                    '&:hover': {
                        borderColor: '#0d47a1 !important',
                        backgroundColor: 'rgba(13, 71, 161, 0.04) !important',
                        color: '#000000 !important',
                    }
                  }}
                >
                  {formData.csvFile ? formData.csvFile.name : '📁 Choose CSV File'}
                </Button>
              </label>
              {formData.csvFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Selected: {formData.csvFile.name}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            sx={{ 
              borderRadius: 2,
              color: '#000000',
              borderColor: '#000000',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#000000',
                color: '#000000'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateGrid}
            disabled={uploading || !formData.name.trim() || !formData.csvFile}
            startIcon={uploading ? <CircularProgress size={16} /> : <AddIcon />}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {uploading ? 'Creating...' : 'Create Grid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>
            Delete Grid
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Are you sure you want to delete "{selectedGrid?.name}"? This will permanently remove all data associated with this grid.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ 
              borderRadius: 2,
              color: '#000000',
              borderColor: '#000000',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#000000',
                color: '#000000'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteGrid}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Delete Grid
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 600
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GridManagement; 