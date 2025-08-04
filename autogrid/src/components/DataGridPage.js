import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Snackbar, Paper, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericDataGrid from './GenericDataGrid';

const API_URL = 'http://localhost:5001/api/data';

export default function DataGridPage({ selectedGrid }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const getColumnOrder = () => {
    if (!selectedGrid?.column_order) {
      return null;
    }
    
    try {
      if (Array.isArray(selectedGrid.column_order)) {
        return selectedGrid.column_order;
      }
      
      if (typeof selectedGrid.column_order === 'string') {
        try {
          const parsed = JSON.parse(selectedGrid.column_order);
          return Array.isArray(parsed) ? parsed : selectedGrid.column_order.split(',');
        } catch (jsonError) {
          const csvArray = selectedGrid.column_order.split(',');
          return csvArray;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const apiUrl = selectedGrid 
    ? `${API_URL}?gridId=${encodeURIComponent(selectedGrid.id)}`
    : API_URL;

  const actions = [
    {
      label: 'View',
      icon: <VisibilityIcon />,
      color: 'primary',
      tooltip: 'View details',
      onClick: (data) => {
        return navigate(`/detail/${data.id}`);
      }
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
    setError(error.message || 'An error occurred while loading data');
  };

  const handleDataLoad = (data) => {
    if (!data) {
      return;
    }
    
    if (!data.data || !Array.isArray(data.data)) {
      return;
    }
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
