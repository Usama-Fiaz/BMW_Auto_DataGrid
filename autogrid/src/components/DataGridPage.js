import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Snackbar, Paper, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericDataGrid from './GenericDataGrid';

const API_URL = 'http://localhost:5001/api/data'; // Universal endpoint for all data

export default function DataGridPage({ selectedGrid }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Debug: Check what column_order contains
  console.log('SelectedGrid:', selectedGrid);
  console.log('Column order type:', typeof selectedGrid?.column_order);
  console.log('Column order value:', selectedGrid?.column_order);

  // Safely parse column order
  const getColumnOrder = () => {
    console.log('getColumnOrder called with selectedGrid:', selectedGrid);
    console.log('column_order value:', selectedGrid?.column_order);
    console.log('column_order type:', typeof selectedGrid?.column_order);
    
    if (!selectedGrid?.column_order) {
      console.log('No column_order found, returning null');
      return null;
    }
    
    try {
      // If it's already an array, return it
      if (Array.isArray(selectedGrid.column_order)) {
        console.log('column_order is already an array:', selectedGrid.column_order);
        return selectedGrid.column_order;
      }
      
      // If it's a string, try to parse as JSON first, then as CSV
      if (typeof selectedGrid.column_order === 'string') {
        console.log('column_order is a string, trying to parse');
        try {
          // Try JSON first
          const parsed = JSON.parse(selectedGrid.column_order);
          console.log('JSON parse successful:', parsed);
          return Array.isArray(parsed) ? parsed : selectedGrid.column_order.split(',');
        } catch (jsonError) {
          console.log('JSON parse failed, treating as CSV');
          // If JSON fails, treat as CSV
          const csvArray = selectedGrid.column_order.split(',');
          console.log('CSV split result:', csvArray);
          return csvArray;
        }
      }
      
      console.log('column_order is not string or array, returning null');
      return null;
    } catch (error) {
      console.error('Error parsing column order:', error);
      return null;
    }
  };

  // Build API URL with grid filter if selected
  const apiUrl = selectedGrid 
    ? `${API_URL}?gridId=${encodeURIComponent(selectedGrid.id)}`
    : API_URL;

  // Generic actions that work with any data
  const actions = [
    {
      label: 'View',
      icon: <VisibilityIcon />,
      color: 'primary',
      tooltip: 'View details',
      onClick: (data) => navigate(`/detail/${data.id}`)
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      color: 'error',
      tooltip: 'Delete record',
      onClick: (data) => {
        return data.id;
      }
    }
  ];

  const handleError = (error) => {
    console.error('DataGrid error:', error);
    setError(error.message || 'An error occurred while loading data');
  };

  const handleDataLoad = (data) => {
    if (!data) {
      console.log('No data received in handleDataLoad');
      return;
    }
    
    if (!data.data || !Array.isArray(data.data)) {
      console.log('Invalid data structure in handleDataLoad:', data);
      return;
    }
    
    console.log(`Loaded ${data.data.length} records out of ${data.total || 0} total`);
  };

  const handleSuccess = (message) => {
    setError(null);
    setSuccess(message);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
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
        <GenericDataGrid
          title={selectedGrid ? `${selectedGrid.name} Data` : "Your Data"}
          apiUrl={apiUrl}
          actions={actions}
          pageSize={20}
          height={700}
          columnOrder={getColumnOrder()}
          onDataLoad={handleDataLoad}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError(null)} 
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
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess(null)} 
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
