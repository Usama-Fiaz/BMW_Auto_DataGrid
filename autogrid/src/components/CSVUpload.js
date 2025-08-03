import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const API_URL = 'http://localhost:5001/api/data'; // Updated to universal endpoint

export default function CSVUpload({ onUploadSuccess, onUploadError, selectedGrid, isReplacement = false }) {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setUploadResult(null);
      } else {
        alert('Please drop a valid CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      // If uploading to a specific grid, add the grid name and ID
      if (selectedGrid) {
        formData.append('name', selectedGrid.name);
        formData.append('gridId', selectedGrid.id);
      }

      // If this is a replacement, add the replacement flag
      if (isReplacement) {
        formData.append('isReplacement', 'true');
      }

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use grid-specific upload if a grid is selected, otherwise use general upload
      const uploadUrl = selectedGrid 
        ? `http://localhost:5001/api/grids/create`
        : `${API_URL}/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message,
          data: result
        });
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      } else {
        setUploadResult({
          success: false,
          message: result.error,
          data: result
        });
        if (onUploadError) {
          onUploadError(result);
        }
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: 'Upload failed. Please try again.',
        data: { error: error.message }
      };
      setUploadResult(errorResult);
      if (onUploadError) {
        onUploadError(errorResult);
      }
    } finally {
      setUploading(false);
      setShowResultDialog(true);
    }
  };

  const handleClear = () => {
    setFile(null);
    setUploadResult(null);
  };

  const getValidationErrorColor = (error) => {
    if (error.includes('required')) return 'error';
    if (error.includes('valid')) return 'warning';
    return 'info';
  };

  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          border: dragActive ? '2px dashed #1976d2' : '2px dashed #e2e8f0',
          backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.02)' : 'white',
          transition: 'all 0.3s ease',
          borderRadius: 4,
          background: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CloudUploadIcon 
            sx={{ 
              fontSize: 64, 
              color: 'primary.main', 
              mb: 2,
              opacity: dragActive ? 0.8 : 1,
              transition: 'all 0.3s ease',
            }} 
          />
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              mb: 1
            }}
          >
            Upload CSV File
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: '1.125rem',
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            Drag and drop any CSV file here, or click the button below to select a file
          </Typography>
        </Box>

        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="center" 
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Button
            variant="contained"
            component="label"
            startIcon={<FileUploadIcon />}
            disabled={uploading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Select CSV File
            <input
              type="file"
              hidden
              accept=".csv,text/csv"
              onChange={handleFileSelect}
            />
          </Button>
          
          {file && (
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1b5e20 0%, #0d4a14 100%)',
                  boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
          
          {file && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClear}
              disabled={uploading}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                borderColor: 'grey.300',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  background: 'rgba(220, 0, 78, 0.04)',
                }
              }}
            >
              Clear
            </Button>
          )}
        </Stack>

        {file && (
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            bgcolor: 'rgba(25, 118, 210, 0.04)', 
            borderRadius: 3,
            border: '1px solid rgba(25, 118, 210, 0.1)',
            mb: 3
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <FileUploadIcon color="primary" sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Selected file: {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                  Size: {Math.round(file.size / 1024)} KB
              </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Alert 
            severity="info" 
            icon={<InfoIcon />} 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '1px solid #90caf9',
              '& .MuiAlert-icon': {
                color: '#1976d2',
              },
              '& .MuiAlert-message': {
                color: '#1565c0',
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              📋 Universal CSV Upload
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload any CSV file - employees, products, sales data, or any data structure. The system will automatically detect and display the columns.
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography variant="body2" component="li">
                First row should contain headers (column names)
              </Typography>
              <Typography variant="body2" component="li">
                Data will be stored as JSON and displayed automatically
              </Typography>
              <Typography variant="body2" component="li">
                Each user's data is isolated and secure
              </Typography>
            </Box>
          </Alert>
        </Box>
      </Paper>

      {/* Upload Result Dialog */}
      <Dialog 
        open={showResultDialog} 
        onClose={() => setShowResultDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Upload Result
            </Typography>
            <IconButton 
              onClick={() => setShowResultDialog(false)}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {uploadResult && (
            <Box>
              {uploadResult.success ? (
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
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {uploadResult.message}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Total records: {uploadResult.data.totalRecords} | 
                    Inserted: {uploadResult.data.insertedCount} | 
                    Skipped: {uploadResult.data.skippedCount}
                  </Typography>
                  {uploadResult.data.verification && (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Verification: {uploadResult.data.verification.idRange} ({uploadResult.data.verification.totalRecords} total records)
                    </Typography>
                  )}
                </Alert>
              ) : (
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
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {uploadResult.message}
                  </Typography>
                </Alert>
              )}

              {uploadResult.data.validationErrors && uploadResult.data.validationErrors.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Validation Errors ({uploadResult.data.validationErrors.length})
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      maxHeight: 400, 
                      overflow: 'auto',
                      borderRadius: 3,
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                    }}
                  >
                    <List dense>
                      {uploadResult.data.validationErrors.map((error, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ py: 2 }}>
                            <ListItemText
                              primary={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Row {error.row}:
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {error.data.Brand} {error.data.Model}
                                  </Typography>
                                </Stack>
                              }
                              secondary={
                                <Box sx={{ mt: 1.5 }}>
                                  {error.errors.map((err, errIndex) => (
                                    <Chip
                                      key={errIndex}
                                      label={err}
                                      color={getValidationErrorColor(err)}
                                      size="small"
                                      sx={{ 
                                        mr: 1, 
                                        mb: 1,
                                        borderRadius: 2,
                                        fontWeight: 500,
                                      }}
                                    />
                                  ))}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < uploadResult.data.validationErrors.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowResultDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              fontWeight: 600,
              px: 3
            }}
          >
            Close
          </Button>
          {uploadResult?.success && (
            <Button 
              variant="contained" 
              onClick={() => {
                setShowResultDialog(false);
                handleClear();
              }}
              sx={{ 
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Upload Another File
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
} 