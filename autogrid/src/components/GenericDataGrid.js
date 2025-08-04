import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useAuth } from '../context/AuthContext';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../styles/ag-grid-modern.css';

import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';



ModuleRegistry.registerModules([AllCommunityModule]);

const customFilterStyles = `
    /* Button text color fixes */
    /* White background buttons - Black text */
    .MuiButton-root[style*="background: white"],
    .MuiButton-root[style*="background-color: white"],
    .MuiButton-root[style*="background: #ffffff"],
    .MuiButton-root[style*="background-color: #ffffff"],
    .MuiButton-root[style*="background: rgba(255, 255, 255"],
    .MuiButton-root[style*="background-color: rgba(255, 255, 255"],
    .MuiButton-root[style*="bgcolor: white"],
    .MuiButton-root[style*="bgcolor: #ffffff"],
    .MuiButton-root[style*="bgcolor: rgba(255, 255, 255"],
    .MuiButton-root[class*="white"],
    .MuiButton-root[class*="light"],
    .MuiButton-root[class*="outlined"] {
        color: #000000 !important;
    }
    
    /* Colored background buttons - White text */
    .MuiButton-root[style*="background: #1976d2"],
    .MuiButton-root[style*="background-color: #1976d2"],
    .MuiButton-root[style*="background: #28a745"],
    .MuiButton-root[style*="background-color: #28a745"],
    .MuiButton-root[style*="background: #dc3545"],
    .MuiButton-root[style*="background-color: #dc3545"],
    .MuiButton-root[style*="background: #6c757d"],
    .MuiButton-root[style*="background-color: #6c757d"],
    .MuiButton-root[style*="bgcolor: #1976d2"],
    .MuiButton-root[style*="bgcolor: #28a745"],
    .MuiButton-root[style*="bgcolor: #dc3545"],
    .MuiButton-root[style*="bgcolor: #6c757d"],
    .MuiButton-root[class*="contained"],
    .MuiButton-root[class*="primary"],
    .MuiButton-root[class*="secondary"],
    .MuiButton-root[class*="success"],
    .MuiButton-root[class*="error"],
    .MuiButton-root[class*="warning"],
    .MuiButton-root[class*="info"] {
        color: #ffffff !important;
    }
    
    /* Ensure button text is always visible */
    .MuiButton-root,
    .MuiButton-root span,
    .MuiButton-root .MuiButton-startIcon,
    .MuiButton-root .MuiButton-endIcon {
        visibility: visible !important;
        opacity: 1 !important;
    }

    .ag-ltr .ag-select .ag-picker-field-wrapper {
        height: 32px;
    }
        .ag-theme-alpine .ag-filter-body {
        padding: 0px;
        background: #ffffff;
    }

    .ag-input-wrapper:before {
        display: none !important;
    }

  .ag-filter-toolpanel-header {
    background: #f8f9fa !important;
    border-bottom: 1px solid #e9ecef !important;
    padding: 12px 16px !important;
    font-weight: 600 !important;
    color: #495057 !important;
  }

  .ag-filter-toolpanel-header-wrapper {
    background: #ffffff !important;
    border: 1px solid #e9ecef !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    min-width: 280px !important;
  }

  .ag-filter-toolpanel-header-wrapper .ag-filter-toolpanel-header {
    border-radius: 8px 8px 0 0 !important;
  }

  .ag-filter-toolpanel-body {
    padding: 16px !important;
    background: #ffffff !important;
    border-radius: 0 0 8px 8px !important;
  }

  .ag-filter-toolpanel-body .ag-filter-condition-operator {
    margin-bottom: 12px !important;
  }

  .ag-filter-toolpanel-body .ag-filter-condition {
    margin-bottom: 16px !important;
  }

  .ag-filter-toolpanel-body .ag-filter-condition:last-child {
    margin-bottom: 0 !important;
  }

  .ag-filter-toolpanel-body select {
    width: 100% !important;
    padding: 8px 12px !important;
    border: 1px solid #ced4da !important;
    border-radius: 6px !important;
    background: #ffffff !important;
    font-size: 14px !important;
    color: #495057 !important;
    margin-bottom: 8px !important;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
  }

  .ag-filter-toolpanel-body select:focus {
    outline: none !important;
    border-color: #1976d2 !important;
    box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25) !important;
  }

  .ag-filter-toolpanel-body input[type="text"] {
    width: 100% !important;
    padding: 8px 12px !important;
    border: 1px solid #ced4da !important;
    border-radius: 6px !important;
    background: #ffffff !important;
    font-size: 14px !important;
    color: #495057 !important;
    margin-bottom: 8px !important;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
  }

  .ag-filter-toolpanel-body input[type="text"]:focus {
    outline: none !important;
    border-color: #1976d2 !important;
    box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25) !important;
  }

  .ag-filter-toolpanel-body .ag-filter-condition-operator input[type="radio"] {
    margin-right: 8px !important;
    margin-left: 0 !important;
  }

  .ag-filter-toolpanel-body .ag-filter-condition-operator label {
    font-size: 14px !important;
    color: #495057 !important;
    margin-right: 16px !important;
    cursor: pointer !important;
  }

  .ag-filter-toolpanel-body .ag-filter-condition-operator label:hover {
    color: #1976d2 !important;
  }

  .ag-filter-toolpanel-body .ag-filter-apply-panel {
    padding: 12px 0 0 0 !important;
    border-top: 1px solid #e9ecef !important;
    margin-top: 16px !important;
  }

  .ag-filter-toolpanel-body .ag-filter-apply-panel button {
    padding: 8px 16px !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    border: 1px solid #ced4da !important;
    background: #ffffff !important;
    color: #495057 !important;
    cursor: pointer !important;
    transition: all 0.15s ease-in-out !important;
    margin-right: 8px !important;
  }

  .ag-filter-toolpanel-body .ag-filter-apply-panel button:hover {
    background: #f8f9fa !important;
    border-color: #adb5bd !important;
  }

  .ag-filter-toolpanel-body .ag-filter-apply-panel button.ag-filter-apply {
    background: #1976d2 !important;
    color: #ffffff !important;
    border-color: #1976d2 !important;
  }

  .ag-filter-toolpanel-body .ag-filter-apply-panel button.ag-filter-apply:hover {
    background: #1565c0 !important;
    border-color: #1565c0 !important;
  }

  .ag-filter-toolpanel-body .ag-filter-apply-panel button.ag-filter-reset {
    background: #6c757d !important;
    color: #ffffff !important;
    border-color: #6c757d !important;
  }

  .ag-filter-toolpanel-body .ag-filter-apply-panel button.ag-filter-reset:hover {
    background: #5a6268 !important;
    border-color: #5a6268 !important;
  }
`;

const GenericDataGrid = ({
  title = 'Data Grid',
  apiUrl,
  actions = [],
  pageSize = 20,
  height = 100,
  searchFields = [],
  columnOrder = null,
  onDataLoad,
  onError,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});

  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [rowData, setRowData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customFilterStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const fixButtonTextColors = () => {
      const buttons = document.querySelectorAll('.MuiButton-root');
      buttons.forEach(button => {
        const style = window.getComputedStyle(button);
        const backgroundColor = style.backgroundColor;
        const bgColor = style.getPropertyValue('background-color');
        
        if (backgroundColor && (
          backgroundColor.includes('rgb(25, 118, 210)') ||
          backgroundColor.includes('rgb(40, 167, 69)') ||
          backgroundColor.includes('rgb(220, 53, 69)') ||
          backgroundColor.includes('rgb(108, 117, 125)') ||
          backgroundColor.includes('1976d2') ||
          backgroundColor.includes('28a745') ||
          backgroundColor.includes('dc3545') ||
          backgroundColor.includes('6c757d')
        )) {
          button.style.color = '#ffffff !important';
        } else if (backgroundColor && (
          backgroundColor.includes('rgb(255, 255, 255)') ||
          backgroundColor.includes('white') ||
          backgroundColor.includes('ffffff')
        )) {
          button.style.color = '#000000 !important';
        }
      });
    };

    fixButtonTextColors();
    
    const timeoutId = setTimeout(fixButtonTextColors, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const detectColumnsFromData = useCallback((data, columnOrder = null) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    let fields = [];
    if (columnOrder && Array.isArray(columnOrder)) {
      fields = columnOrder;
    } else {
      const firstRow = data[0];
      if (!firstRow) {
        return [];
      }

      let jsonData;
      try {
        if (firstRow.data) {
          jsonData = typeof firstRow.data === 'string' ? JSON.parse(firstRow.data) : firstRow.data;
        } else {
          jsonData = firstRow;
        }
      } catch (error) {
        return [];
      }

      if (!jsonData || typeof jsonData !== 'object') {
        return [];
      }

      fields = Object.keys(jsonData).filter(field => field !== null && field !== undefined);
    }
    
    if (!Array.isArray(fields) || fields.length === 0) return [];
    
    const detectedColumns = fields.map(field => {
      if (!field || typeof field !== 'string') return null;
      
      let sampleValue = null;
      try {
        if (data[0] && data[0].data) {
          const firstRowData = typeof data[0].data === 'string' ? JSON.parse(data[0].data) : data[0].data;
          sampleValue = firstRowData[field];
        } else if (data[0]) {
          sampleValue = data[0][field];
        }
      } catch (error) {
      }
      
      let filterType = 'agTextColumnFilter';
      let filterOptions = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty'];
      
      const numValue = typeof sampleValue === 'string' ? sampleValue.trim() : sampleValue;
      if (typeof sampleValue === 'number' || (typeof numValue === 'string' && !isNaN(Number(numValue)) && numValue !== '')) {
        filterType = 'agNumberColumnFilter';
        filterOptions = ['equals', 'greaterThan', 'lessThan'];
      }
      
      if (sampleValue && (typeof sampleValue === 'string' && (sampleValue.includes('-') || sampleValue.includes('/')))) {
        const dateValue = new Date(sampleValue);
        if (!isNaN(dateValue.getTime())) {
          filterType = 'agDateColumnFilter';
          filterOptions = ['equals', 'greaterThan', 'lessThan'];
        }
      }
      
      return {
        field: field,
        headerName: field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
        width: 150,
        sortable: true,
        filter: filterType,
        filterParams: {
          filterOptions: filterOptions,
          defaultOption: 'contains',
          buttons: ['apply', 'reset'],
          closeOnApply: false,
          suppressAndOrCondition: false,
          alwaysShowBothConditions: false,
          applyMiniFilterWhileTyping: false,
          applyButton: true,
          resetButton: true,
        },
        valueGetter: (params) => {
          if (!params.data) {
            return null;
          }
          
          let jsonData;
          try {
            if (params.data.data) {
              jsonData = typeof params.data.data === 'string' ? JSON.parse(params.data.data) : params.data.data;
            } else {
              jsonData = params.data;
            }
          } catch (error) {
            return null;
          }
          
          return jsonData && jsonData[field] !== undefined ? jsonData[field] : null;
        },
        valueFormatter: (params) => {
          if (!params.value) return '-';
          
          if (typeof params.value === 'number') {
            return params.value.toLocaleString();
          }
          
          if (params.value && typeof params.value === 'string' && (params.value.includes('-') || params.value.includes('/'))) {
            const date = new Date(params.value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString();
            }
          }
          
          return params.value;
        },
        filterValueGetter: (params) => {
          if (!params.data) return null;
          
          let jsonData;
          try {
            if (params.data.data) {
              jsonData = typeof params.data.data === 'string' ? JSON.parse(params.data.data) : params.data.data;
            } else {
              jsonData = params.data;
            }
          } catch (error) {
            return null;
          }
          
          const value = jsonData && jsonData[field] !== undefined ? jsonData[field] : null;
          if (filterType === 'agNumberColumnFilter') {
            return Number(value);
          }
          return value;
        }
      };
    }).filter(col => col !== null);

    return detectedColumns;
  }, []);

  const columnDefs = useMemo(() => {
    if (columns.length === 0) {
      return [];
    }
    
    const dataColumns = columns.map(col => {
      const headerLength = col.headerName ? col.headerName.length : 10;
      const baseWidth = Math.max(200, headerLength * 25);
      const calculatedWidth = Math.min(baseWidth, 800);
      
      const columnDef = {
        field: col.field,
        headerName: col.headerName,
        sortable: col.sortable !== false,
        filter: col.filter !== false,
        width: col.width || calculatedWidth,
        minWidth: Math.max(200, headerLength * 20),
        maxWidth: Math.min(1000, headerLength * 30),
        flex: 1,
        filterParams: col.filterParams,
        valueGetter: col.valueGetter,
        valueFormatter: col.valueFormatter,
        filterValueGetter: col.filterValueGetter,
        suppressMenu: false,
        suppressMovable: true,
        suppressKeyboardEvent: (params) => {
          return params.event.key === 'Tab';
        }
      };
      return columnDef;
    });

    const actionsColumn = {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 180,
      minWidth: 180,
      maxWidth: 180,
      flex: 0,
      suppressMenu: true,
      suppressMovable: true,
      cellRenderer: (params) => {
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {actions.map((action, index) => (
              <IconButton
                key={index}
                onClick={() => {
                  if (action.onClick) {
                    const result = action.onClick(params.data);
                    if (action.label === 'Delete' && result) {
                      setDeleteItem(result);
                      setDeleteDialogOpen(true);
                    }
                  }
                }}
                size="small"
                sx={{
                  color: action.color === 'error' ? '#f44336' : '#1976d2',
                  '&:hover': {
                    backgroundColor: action.color === 'error' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                  }
                }}
                title={action.tooltip || action.label}
              >
                {action.icon}
              </IconButton>
            ))}
          </div>
        );
      }
    };

    return [...dataColumns, actionsColumn];
  }, [columns, actions]);

  const loadData = useCallback(async (page = 1, pageSize = currentPageSize, sortBy = null, sortOrder = null, searchValue = null) => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        limit: pageSize,
      };

      const currentSearch = searchValue !== null ? searchValue : search;
      
      if (currentSearch && currentSearch.trim() !== '') {
        queryParams.search = currentSearch.trim();
      }

      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          queryParams[key] = value;
        }
      });

      if (sortBy && sortOrder) {
        queryParams.sortBy = sortBy;
        queryParams.sortOrder = sortOrder;
      }

      Object.keys(queryParams).forEach(key => 
        queryParams[key] === undefined && delete queryParams[key]
      );

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const separator = apiUrl.includes('?') ? '&' : '?';
      const response = await fetch(`${apiUrl}${separator}${new URLSearchParams(queryParams)}`, {
        headers
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      const newRowData = data.data || [];
      setRowData(newRowData);
      setTotalRows(data.total || 0);
      setCurrentPage(page);
      setTotalPages(Math.ceil((data.total || 0) / pageSize));

      if (newRowData.length > 0) {
        const detected = detectColumnsFromData(newRowData, columnOrder);
        setColumns(detected);
      }
      
      if (onDataLoad) {
        onDataLoad({
          data: newRowData,
          total: data.total || 0,
          page: page,
          limit: pageSize
        });
      }
      
      if (onSuccess) {
        onSuccess(`Successfully loaded ${newRowData.length} records`);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, search, activeFilters, currentPageSize, detectColumnsFromData, columnOrder, onDataLoad, onError, onSuccess]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      loadData(1, currentPageSize);
    }
  }, [activeFilters, currentPageSize, loadData]);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
    loadData(1, currentPageSize);
  }, [loadData, currentPageSize]);

  const convertToAGGridFilterModel = useCallback((activeFilters) => {
    const convertedFilterModel = {};

    Object.entries(activeFilters).forEach(([key, value]) => {
      const parts = key.split('.');
      if (parts.length >= 3) {
        const field = parts[1];
        const operator = parts[2];
        
        if (!convertedFilterModel[field]) {
          convertedFilterModel[field] = {};
        }

        if (operator === 'isEmpty') {
          convertedFilterModel[field] = {
            type: 'isEmpty'
          };
        } else if (operator.endsWith('2')) {
          const baseOperator = operator.slice(0, -1);
          if (!convertedFilterModel[field].condition2) {
            convertedFilterModel[field].condition2 = {
              type: baseOperator,
              filter: value
            };
          }
        } else {
          convertedFilterModel[field] = {
            type: operator,
            filter: value
          };
        }
      }
    });

    return convertedFilterModel;
  }, []);

  const setFilterModel = useCallback(() => {
    if (!gridApi) return;
    
    const convertedFilterModel = convertToAGGridFilterModel(activeFilters);
    if (Object.keys(convertedFilterModel).length > 0) {
      gridApi.setFilterModel(convertedFilterModel);
    }
  }, [gridApi, activeFilters, convertToAGGridFilterModel]);

  const handleSearch = useCallback(() => {
    loadData(1, currentPageSize);
  }, [loadData, currentPageSize, search]);



  const handleDelete = useCallback(async (id) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const baseUrl = apiUrl.split('?')[0];
      const queryParams = apiUrl.includes('?') ? apiUrl.split('?')[1] : '';
      const deleteUrl = queryParams 
        ? `${baseUrl}/${id}?${queryParams}`
        : `${baseUrl}/${id}`;

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
      
      setDeleteDialogOpen(false);
      setDeleteItem(null);
      
      if (onSuccess) {
        onSuccess('Record deleted successfully');
      }
      
      loadData();
    } catch (err) {
      if (onError) {
        onError(err);
      }
    }
  }, [apiUrl, loadData, onError, onSuccess, token]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadData(newPage, currentPageSize);
    }
  }, [loadData, totalPages, currentPageSize]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setCurrentPageSize(newPageSize);
    loadData(1, newPageSize);
  }, [loadData]);

  const onFilterChanged = useCallback(() => {
    if (gridApi) {
      try {
        const filterModel = gridApi.getFilterModel ? gridApi.getFilterModel() : {};
        console.log('Current filter model:', filterModel);
      
        const newActiveFilters = {};
        
        Object.entries(filterModel).forEach(([field, filterData]) => {
          if (field === 'id' || field === 'added_by' || field === 'created_at' || field === 'actions') {
            return;
          }
          

          
          if (filterData.type === 'isEmpty') {
            newActiveFilters[`${field}_isEmpty`] = 'true';
          } else if (filterData.filter && filterData.filter !== '') {
            newActiveFilters[`${field}_${filterData.type}`] = filterData.filter;
          } else if (filterData.condition1 && filterData.condition1.filter) {
            newActiveFilters[`${field}_${filterData.condition1.type}`] = filterData.condition1.filter;
            if (filterData.condition2 && filterData.condition2.filter) {
              newActiveFilters[`${field}_${filterData.condition2.type}`] = filterData.condition2.filter;
              newActiveFilters[`${field}_logic`] = filterData.operator || 'OR';
            }
          } else if (filterData.conditions && Array.isArray(filterData.conditions)) {
            filterData.conditions.forEach((condition, index) => {
              if (condition.filter && condition.filter !== '') {
                newActiveFilters[`${field}_${condition.type}`] = condition.filter;
              }
            });
            if (filterData.conditions.length > 1) {
              newActiveFilters[`${field}_logic`] = filterData.operator || 'OR';
            }
          }
        });
        
        setActiveFilters(prevFilters => {
          const mergedFilters = { ...prevFilters, ...newActiveFilters };
          return mergedFilters;
        });
        
        setFilters(prevFilters => {
          const mergedFilters = { ...prevFilters, ...newActiveFilters };
          return mergedFilters;
        });
      } catch (error) {
      }
    }
  }, [gridApi, loadData, currentPageSize]);

  const syncFilterPopup = useCallback((columnApi, field) => {
    if (!columnApi || !field) return;
    
    const column = columnApi.getColumn(field);
    if (!column) return;
    
    try {
      const filterModel = gridApi?.getFilterModel ? gridApi.getFilterModel() : {};
      if (!filterModel || !filterModel[field]) return;
    
      const filterData = filterModel[field];
      const filterInstance = column.getFilterInstance();
      
      if (filterInstance) {
        if (filterData.type) {
          filterInstance.setFilterType(filterData.type);
        }
        if (filterData.filter) {
          filterInstance.setFilter(filterData.filter);
        }
      }
    } catch (error) {
    }
  }, [gridApi]);

  const onFilterModified = useCallback((event) => {
  }, []);

  const onFilterOpened = useCallback((event) => {
    if (event.column && gridApi) {
      setTimeout(() => {
        syncFilterPopup(gridApi.columnApi, event.column.getColId());
      }, 100);
    }
  }, [gridApi, syncFilterPopup]);

  const onSortChanged = useCallback((event) => {
    if (gridApi) {
      try {
        const sortModel = gridApi.getSortModel ? gridApi.getSortModel() : [];
        if (sortModel && sortModel.length > 0) {
          const sort = sortModel[0];
          loadData(1, currentPageSize, sort.colId, sort.sort);
        } else {
          loadData(1, currentPageSize);
        }
      } catch (error) {
        loadData(1, currentPageSize);
      }
    }
  }, [gridApi, currentPageSize, loadData]);

  const handleExport = useCallback(() => {
    if (!rowData || !Array.isArray(rowData) || rowData.length === 0) {
      console.warn('No data to export');
      return;
    }

    try {
      const firstRow = rowData[0];
      if (!firstRow || !firstRow.data) {
        console.warn('Invalid data structure for export');
        return;
      }

      const rowDataItem = typeof firstRow.data === 'string' ? JSON.parse(firstRow.data) : firstRow.data;
      const columns = Object.keys(rowDataItem || {}).filter(col => col !== 'actions');
      
      if (columns.length === 0) {
        console.warn('No valid columns found for export');
        return;
      }
      
      const csvHeader = columns.join(',');
      
      const csvRows = rowData.map(row => {
        if (!row || !row.data) return '';
        
        const rowDataItem = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return columns.map(col => {
          const value = rowDataItem[col];
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',');
      }).filter(row => row !== '');
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title || 'data'}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
    }
  }, [rowData, title]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '100%', width: '100%' }}>
      {title && (
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
          sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 2 }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'primary.main', 
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            {title}
          </Typography>

        </Stack>
      )}



      <Stack 
        direction="row" 
        spacing={2} 
        mb={3} 
        alignItems="center" 
        flexWrap="wrap"
        sx={{ 
          gap: 2,
          justifyContent: { xs: 'center', sm: 'space-between' }
        }}
      >
        <Stack 
          direction="row" 
          spacing={0.5} 
          alignItems="center" 
          flexWrap="wrap"
          sx={{ gap: 0.5 }}
        >
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ 
              maxWidth: 300, 
              borderRadius: 1,
              minWidth: { xs: '100%', sm: 250 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                background: 'white',
                              '& input': {
                color: 'black',
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.6)',
              },
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  }
                }
              }
            }}
            placeholder="Search in all fields..."
            InputProps={{
              startAdornment: <SearchIcon color="primary" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disableRipple={true}
            sx={{ 
              borderRadius: 1,
              fontWeight: 600,
              px: 3,
              py: 1,
              minWidth: 100,
              backgroundColor: '#007bff',
              color: 'white !important',
              border: '1px solid #007bff !important',
              boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3) !important',
              
              '&:hover': {
                backgroundColor: '#0056b3',
                borderColor: '#0056b3',
                boxShadow: '0 6px 16px rgba(0, 123, 255, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)',
              },
              '&:active': {
                backgroundColor: '#004080',
                borderColor: '#004080',
                color: 'white',
                boxShadow: 'inset 0 3px 5px rgba(0, 0, 0, 0.2)',
                transform: 'translateY(0)',
              }
            }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ClearIcon />}
            disableRipple={true}
            onClick={() => {
              setSearch('');
              setFilters({});
              setActiveFilters({});
              if (gridApi) {
                gridApi.setFilterModel({});
              }
              loadData(1, currentPageSize);
            }}
            sx={{ 
              borderRadius: 1,
              fontWeight: 600,
              px: 3,
              py: 1,
              minWidth: 100,
              backgroundColor: '#6c757d',
              color: 'white',
              border: '1px solid #6c757d',
              '&:hover': {
                backgroundColor: '#5a6268',
                borderColor: '#5a6268',
                color: 'white',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Clear All
          </Button>

     
        </Stack>

        {/* Export button positioned on the right */}
        <Button
          variant="contained"
          color="success"
          disableRipple={true}
          startIcon={<FileDownloadIcon sx={{ verticalAlign: 'middle' }} />}
          onClick={handleExport}
          disabled={!rowData || rowData.length === 0}
          sx={{ 
            borderRadius: 1,
            fontWeight: 600,
            px: 3,
            py: 1,
            minWidth: 100,
            backgroundColor: '#28a745',
            color: 'white',
            border: '1px solid #28a745',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .MuiButton-startIcon': {
              marginRight: 1,
              display: 'flex',
              alignItems: 'center',
            },
            '&:hover': {
              backgroundColor: '#218838',
              borderColor: '#218838',
              boxShadow: '0 6px 16px rgba(40, 167, 69, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              backgroundColor: '#6c757d',
              borderColor: '#6c757d',
              color: '#adb5bd',
              cursor: 'not-allowed',
              transform: 'none',
            }
          }}
        >
          Export
        </Button>
      </Stack>

      {Object.keys(activeFilters).length > 0 && (
        <Stack 
          direction="row" 
          spacing={1} 
          mb={3} 
          flexWrap="wrap"
          sx={{ gap: 1 }}
        >
          {(() => {
            const fieldGroups = {};
            Object.entries(activeFilters).forEach(([key, value]) => {
              if (!value) return;
              
              if (key.endsWith('_logic')) return;
              
              const parts = key.split('_');
              if (parts.length < 2) return;
              
              const validOperators = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'];
              let operator = '';
              let field = '';
              
              for (const op of validOperators) {
                if (key.includes(op)) {
                  operator = op;
                  const operatorIndex = key.indexOf(op);
                  field = key.substring(0, operatorIndex - 1);
                  break;
                }
              }
              
              if (!operator || !field) return;
              
              if (!fieldGroups[field]) {
                fieldGroups[field] = [];
              }
              
              fieldGroups[field].push({ key, operator, value, field });
            });
            
            return Object.entries(fieldGroups).map(([field, filters]) => {
              const column = columns.find(col => col.field === field);
              const fieldName = column?.headerName || field;
              
              const operatorNames = {
                'contains': 'contains',
                'equals': 'equals',
                'startsWith': 'starts with',
                'endsWith': 'ends with',
                'isEmpty': 'is empty',
                'greaterThan': 'greater than',
                'lessThan': 'less than'
              };
              
              if (filters.length > 1) {
                const filterDescriptions = filters.map(f => {
                  const friendlyOperator = operatorNames[f.operator] || f.operator;
                  return f.operator === 'isEmpty' 
                    ? `${friendlyOperator}`
                    : `${friendlyOperator} ${f.value}`;
                });
                
                const logicKey = `${field}_logic`;
                const logicValue = activeFilters[logicKey];
                const logicOperator = logicValue === 'AND' ? ' AND ' : ' OR ';
                
                const chipLabel = `${fieldName}: ${filterDescriptions.join(logicOperator)}`;
                
                return (
                  <Chip
                    key={`ag-${field}-multi`}
                    label={chipLabel}
                    onDelete={() => {
                      console.log('Removing filters for field:', field);
                      console.log('Current activeFilters before removal:', activeFilters);
                      
                      const currentActiveFilters = Object.keys(activeFilters).filter(key => 
                        !key.endsWith('_logic') && activeFilters[key]
                      );
                      const filtersForThisField = currentActiveFilters.filter(key => 
                        key.startsWith(field + '_')
                      );
                      const willBeLastPill = currentActiveFilters.length === filtersForThisField.length;
                      
                      console.log('Current active filters:', currentActiveFilters);
                      console.log('Filters for this field:', filtersForThisField);
                      console.log('Will be last pill:', willBeLastPill);
                      
                      setFilters(prev => {
                        const newFilters = { ...prev };
                        Object.keys(newFilters).forEach(filterKey => {
                          if (filterKey.startsWith(field + '_')) {
                            console.log('Removing filter key:', filterKey);
                            delete newFilters[filterKey];
                          }
                        });
                        console.log('New filters after removal:', newFilters);
                        return newFilters;
                      });
                      
                      setActiveFilters(prev => {
                        const newActiveFilters = { ...prev };
                        Object.keys(newActiveFilters).forEach(filterKey => {
                          if (filterKey.startsWith(field + '_')) {
                            console.log('Removing activeFilter key:', filterKey);
                            delete newActiveFilters[filterKey];
                          }
                        });
                        console.log('New activeFilters after removal:', newActiveFilters);
                        return newActiveFilters;
                      });
                      
                      if (gridApi) {
                        const filterModel = gridApi.getFilterModel();
                        delete filterModel[field];
                        gridApi.setFilterModel(filterModel);
                      }
                      
                      setTimeout(() => {
                        if (willBeLastPill) {
                          console.log('Last filter removed - fetching initial data');
                          setSearch('');
                          loadData(1, currentPageSize, null, null, '');
                        } else {
                          console.log('Filters remaining - reloading with remaining filters');
                          loadData(1, currentPageSize);
                        }
                      }, 100);
                    }}
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1, 
                      fontWeight: 500, 
                      fontSize: 15, 
                      mb: 1,
                      background: 'rgba(25, 118, 210, 0.08)',
                      borderColor: 'primary.main',
                      '&:hover': {
                        background: 'rgba(25, 118, 210, 0.12)',
                      }
                    }}
                  />
                );
              } else {
                const filter = filters[0];
                const friendlyOperator = operatorNames[filter.operator] || filter.operator;
                
                const chipLabel = (filter.operator === 'isEmpty') 
                  ? `${fieldName} ${friendlyOperator}`
                  : `${fieldName} ${friendlyOperator} ${filter.value}`;
                
                return (
                  <Chip
                    key={`ag-${filter.key}`}
                    label={chipLabel}
                    onDelete={() => {
                      console.log('Removing single filter for field:', field);
                      console.log('Current activeFilters before removal:', activeFilters);
                      
                      const currentActiveFilters = Object.keys(activeFilters).filter(key => 
                        !key.endsWith('_logic') && activeFilters[key]
                      );
                      const filtersForThisField = currentActiveFilters.filter(key => 
                        key.startsWith(field + '_')
                      );
                      const willBeLastPill = currentActiveFilters.length === filtersForThisField.length;
                      
                      console.log('Current active filters:', currentActiveFilters);
                      console.log('Filters for this field:', filtersForThisField);
                      console.log('Will be last pill:', willBeLastPill);
                      
                      setFilters(prev => {
                        const newFilters = { ...prev };
                        Object.keys(newFilters).forEach(filterKey => {
                          if (filterKey.startsWith(field + '_')) {
                            console.log('Removing filter key:', filterKey);
                            delete newFilters[filterKey];
                          }
                        });
                        console.log('New filters after removal:', newFilters);
                        return newFilters;
                      });
                      
                      setActiveFilters(prev => {
                        const newActiveFilters = { ...prev };
                        Object.keys(newActiveFilters).forEach(filterKey => {
                          if (filterKey.startsWith(field + '_')) {
                            console.log('Removing activeFilter key:', filterKey);
                            delete newActiveFilters[filterKey];
                          }
                        });
                        console.log('New activeFilters after removal:', newActiveFilters);
                        return newActiveFilters;
                      });
                      
                      if (gridApi) {
                        const filterModel = gridApi.getFilterModel();
                        delete filterModel[field];
                        gridApi.setFilterModel(filterModel);
                      }
                      
                      setTimeout(() => {
                        if (willBeLastPill) {
                          console.log('Last filter removed - fetching initial data');
                          setSearch('');
                          loadData(1, currentPageSize, null, null, '');
                        } else {
                          console.log('Filters remaining - reloading with remaining filters');
                          loadData(1, currentPageSize);
                        }
                      }, 100);
                    }}
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1, 
                      fontWeight: 500, 
                      fontSize: 15, 
                      mb: 1,
                      background: 'rgba(25, 118, 210, 0.08)',
                      borderColor: 'primary.main',
                      '&:hover': {
                        background: 'rgba(25, 118, 210, 0.12)',
                      }
                    }}
                  />
                );
              }
            });
          })()}

        </Stack>
      )}

      <Box sx={{ 
        borderRadius: 2, 
        overflow: 'hidden', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        background: 'white'
      }}>
        <div className="ag-theme-alpine" style={{ height: height, width: '100%' }}>
          <AgGridReact
            key={`grid-${columns.length}-${rowData.length}`}
            columnDefs={columnDefs}
            rowData={rowData}
            pagination={false}
            rowHeight={50}
            onGridReady={onGridReady}
            onFilterChanged={onFilterChanged}
            onFilterModified={onFilterModified}
            onFilterOpened={onFilterOpened}
            onSortChanged={onSortChanged}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              autoHeight: false,
              wrapText: false,
              suppressMovable: true,
              suppressMenu: false,
              suppressKeyboardEvent: (params) => {
                return params.event.key === 'Tab';
              }
            }}
            animateRows={false}
            enableCellTextSelection={true}
            suppressRowClickSelection={true}
            suppressColumnVirtualisation={false}
            suppressRowVirtualisation={false}
            rowBuffer={5}
            maxBlocksInCache={5}
            cacheBlockSize={50}
            maxConcurrentDatasourceRequests={1}
            blockLoadDebounceMillis={50}
            suppressAnimationFrame={true}
            suppressBrowserResizeObserver={true}
            suppressPropertyNamesCheck={true}
            suppressFieldDotNotation={true}
            onFirstDataRendered={(params) => {
              if (params.api) {
                params.api.sizeColumnsToFit();
              }
            }}
          />
        </div>
      </Box>

      <Box sx={{ 
        mt: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        background: 'rgba(248, 250, 252, 0.8)',
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Showing {rowData.length} of {totalRows} records
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={currentPageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              displayEmpty
              sx={{ 
                borderRadius: 1,
                background: 'white',
                color: '#000000',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'grey.300',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '& .MuiSelect-select': {
                  color: '#000000',
                  visibility: 'visible',
                  opacity: 1,
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': {
                      color: '#000000',
                      visibility: 'visible',
                      opacity: 1,
                    }
                  }
                }
              }}
            >
              <MenuItem value={10} sx={{ color: '#000000' }}>10 per page</MenuItem>
              <MenuItem value={20} sx={{ color: '#000000' }}>20 per page</MenuItem>
              <MenuItem value={50} sx={{ color: '#000000' }}>50 per page</MenuItem>
              <MenuItem value={100} sx={{ color: '#000000' }}>100 per page</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Page {currentPage} of {totalPages}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => handlePageChange(1)} 
              disabled={currentPage === 1} 
              sx={{ 
                borderRadius: 1,
                fontWeight: 600,
                minWidth: 60,
                color: '#1976d2',
                borderColor: '#1976d2',
                visibility: 'visible',
                opacity: 1,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  borderColor: '#1565c0',
                  color: '#1976d2',
                },
                '&:disabled': {
                  color: '#ccc',
                  borderColor: '#ccc',
                },
                '& .MuiButton-label': {
                  color: '#1976d2',
                  visibility: 'visible',
                  opacity: 1,
                }
              }}
            >
              First
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1} 
              sx={{ 
                borderRadius: 1,
                fontWeight: 600,
                minWidth: 80,
                color: '#1976d2',
                borderColor: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  borderColor: '#1565c0',
                  color: '#1976d2',
                },
                '&:disabled': {
                  color: '#ccc',
                  borderColor: '#ccc',
                },
                '& .MuiButton-label': {
                  color: '#1976d2',
                }
              }}
            >
              Previous
            </Button>
            <Button 
            id='lasttt'
              size="small" 
              variant="outlined"
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages} 
              sx={{ 
                borderRadius: 1,
                fontWeight: 600,
                minWidth: 60,
                color: '#1976d2',
                borderColor: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  borderColor: '#1565c0',
                  color: '#1976d2',
                },
                '&:disabled': {
                  color: '#ccc',
                  borderColor: '#ccc',
                },
                '& .MuiButton-label': {
                  color: '#1976d2',
                }
              }}
            >
              Next
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => handlePageChange(totalPages)} 
              disabled={currentPage === totalPages} 
              sx={{ 
                borderRadius: 1,
                fontWeight: 600,
                minWidth: 60,
                color: '#1976d2',
                borderColor: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  borderColor: '#1565c0',
                  color: '#1976d2',
                },
                '&:disabled': {
                  color: '#ccc',
                  borderColor: '#ccc',
                },
                '& .MuiButton-label': {
                  color: '#1976d2',
                }
              }}
            >
              Last
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {deleteItem && (
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              Are you sure you want to delete this record?
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone and will permanently remove this record from the database.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 1,
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deleteItem)}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ 
              borderRadius: 1,
              fontWeight: 600,
              px: 3,
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(211, 47, 47, 0.4)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GenericDataGrid; 