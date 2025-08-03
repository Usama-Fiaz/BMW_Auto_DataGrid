const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('../config/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Database connection
const getConnection = async () => {
  return mysql.createConnection({
    host: '127.0.0.1', // Force IPv4
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bmw_datagrid',
    charset: 'utf8mb4'
  });
};

// Create universal data table if it doesn't exist
const createUniversalTable = async (connection) => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS universal_data (
      id VARCHAR(36) PRIMARY KEY,
      data JSON NOT NULL,
      added_by VARCHAR(255) NOT NULL,
      grid_id VARCHAR(36) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_added_by (added_by),
      INDEX idx_grid_id (grid_id),
      INDEX idx_added_by_grid (added_by, grid_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await connection.execute(createTableSQL);
    console.log('Universal data table ready');
  } catch (error) {
    console.error('Error creating universal data table:', error);
    throw error;
  }
};



// GET /api/data - Get all data for the authenticated user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const connection = await getConnection();
    await createUniversalTable(connection);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const gridId = req.query.gridId; // New parameter for grid filtering
    const addedBy = req.user.id; // From auth middleware

    console.log('Debug - Parameters:', { page, limit, offset, addedBy, search });

    let whereClause = 'WHERE added_by = ?';
    const params = [addedBy];

    // Add grid filtering if gridId is provided
    if (gridId) {
      whereClause += ' AND grid_id = ?';
      params.push(gridId);
    }

    // Handle global search - comprehensive search for both text and numeric values (case-insensitive)
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      console.log('🔍 Global search term:', searchTerm);
      whereClause += ` AND (
        JSON_SEARCH(data, "all", ?) IS NOT NULL OR
        JSON_SEARCH(data, "all", ?) IS NOT NULL OR
        JSON_SEARCH(data, "all", ?) IS NOT NULL OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.Brand'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.Model'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.BodyStyle'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.Segment'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.PlugType'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.PowerTrain'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.RapidCharge'))) LIKE ?
      )`;
      params.push(searchTerm);
      params.push(searchTerm.toLowerCase());
      params.push(searchTerm.toUpperCase());
      params.push(`%${searchTerm.toLowerCase()}%`);
      params.push(`%${searchTerm.toLowerCase()}%`);
      params.push(`%${searchTerm.toLowerCase()}%`);
      params.push(`%${searchTerm.toLowerCase()}%`);
      params.push(`%${searchTerm.toLowerCase()}%`);
      params.push(`%${searchTerm.toLowerCase()}%`);
      params.push(`%${searchTerm.toLowerCase()}%`);
      console.log('🔍 Search parameters (case-insensitive):', [searchTerm, searchTerm.toLowerCase(), searchTerm.toUpperCase(), `%${searchTerm.toLowerCase()}%`]);
    }

    // Handle advanced column filters
    const filterConditions = [];
    const fieldFilters = {}; // Group filters by field
    const fieldLogic = {}; // Track logic type for each field (OR/AND)
    
    // Process all query parameters for filtering
    Object.keys(req.query).forEach(key => {
      if (key.includes('_') && !['page', 'limit', 'search', 'gridId'].includes(key)) {
        // Handle field names with underscores by finding the last underscore
        const lastUnderscoreIndex = key.lastIndexOf('_');
        if (lastUnderscoreIndex === -1) return;
        
        // Extract field and operator, handling field names that contain underscores
        let field = key.substring(0, lastUnderscoreIndex);
        let operator = key.substring(lastUnderscoreIndex + 1);
        const value = req.query[key];
        
        // Check if the operator is valid, if not, try to find a valid operator
        const validOperators = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'];
        
        console.log(`Initial parsing - field: ${field}, operator: ${operator}, valid: ${validOperators.includes(operator)}`);
        
        if (!validOperators.includes(operator)) {
          // Try to find a valid operator by looking for it in the key
          console.log(`Looking for valid operator in key: ${key}`);
          for (const validOp of validOperators) {
            if (key.includes(validOp)) {
              // Extract field name before the valid operator
              const operatorIndex = key.indexOf(validOp);
              field = key.substring(0, operatorIndex - 1); // -1 to remove the underscore
              operator = validOp;
              console.log(`Found valid operator: ${validOp}, new field: ${field}`);
              break;
            }
          }
        }
        
        console.log(`Processing filter: field=${field}, operator=${operator}, value=${value}`);
        
        if (value !== undefined && value !== '') {
          // Group filters by field
          if (!fieldFilters[field]) {
            fieldFilters[field] = [];
          }
          
          // Check if this field has a logic specification (e.g., Brand_logic=AND)
          const logicKey = `${field}_logic`;
          if (req.query[logicKey]) {
            fieldLogic[field] = req.query[logicKey].toUpperCase();
          }
          
          let condition = '';
          let filterParams = [];
          
          switch (operator) {
            case 'contains':
              condition = `LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.${field}'))) LIKE ?`;
              filterParams = [`%${value.toLowerCase()}%`];
              break;
            
            case 'equals':
              condition = `LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.${field}'))) = ?`;
              filterParams = [value.toLowerCase()];
              break;
            
            case 'startsWith':
              condition = `LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.${field}'))) LIKE ?`;
              filterParams = [`${value.toLowerCase()}%`];
              break;
            
            case 'endsWith':
              condition = `LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.${field}'))) LIKE ?`;
              filterParams = [`%${value.toLowerCase()}`];
              break;
            
            case 'isEmpty':
              condition = `(JSON_EXTRACT(data, '$.${field}') IS NULL OR JSON_EXTRACT(data, '$.${field}') = '' OR JSON_EXTRACT(data, '$.${field}') = 'null' OR JSON_EXTRACT(data, '$.${field}') = 'undefined')`;
              filterParams = [];
              break;
            
            case 'greaterThan':
              condition = `CAST(JSON_EXTRACT(data, '$.${field}') AS DECIMAL(10,2)) > ?`;
              filterParams = [parseFloat(value)];
              break;
            
            case 'lessThan':
              condition = `CAST(JSON_EXTRACT(data, '$.${field}') AS DECIMAL(10,2)) < ?`;
              filterParams = [parseFloat(value)];
              break;
            
            case 'greaterThanOrEqual':
              condition = `CAST(JSON_EXTRACT(data, '$.${field}') AS DECIMAL(10,2)) >= ?`;
              filterParams = [parseFloat(value)];
              break;
            
            case 'lessThanOrEqual':
              condition = `CAST(JSON_EXTRACT(data, '$.${field}') AS DECIMAL(10,2)) <= ?`;
              filterParams = [parseFloat(value)];
              break;
            
            default:
              console.log(`Unknown filter operator: ${operator}`);
              return;
          }
          
          if (condition) {
            fieldFilters[field].push({ condition, params: filterParams });
            console.log(`Added filter condition for ${field}: ${condition}`);
          }
        }
      }
    });
    
    // Process field filters - use specified logic (OR/AND) within same field, AND between different fields
    Object.keys(fieldFilters).forEach(field => {
      const fieldConditions = fieldFilters[field];
      if (fieldConditions.length === 1) {
        // Single condition for this field
        filterConditions.push(fieldConditions[0].condition);
        params.push(...fieldConditions[0].params);
      } else if (fieldConditions.length > 1) {
        // Multiple conditions for this field - use specified logic (default to OR)
        const logic = fieldLogic[field] || 'OR';
        const logicConditions = fieldConditions.map(fc => fc.condition);
        const logicParams = fieldConditions.flatMap(fc => fc.params);
        filterConditions.push(`(${logicConditions.join(` ${logic} `)})`);
        params.push(...logicParams);
        console.log(`Applied ${logic} logic for field ${field}: ${logicConditions.join(` ${logic} `)}`);
      }
    });
    
    // Add filter conditions to where clause
    if (filterConditions.length > 0) {
      whereClause += ' AND ' + filterConditions.join(' AND ');
    }

    console.log('Final where clause:', whereClause);
    console.log('Final params:', params);
    console.log('Filter conditions count:', filterConditions.length);

    // Get total count
    const countSQL = `SELECT COUNT(*) as total FROM universal_data ${whereClause}`;
    console.log('Count SQL:', countSQL, 'Params:', params);
    const [countResult] = await connection.execute(countSQL, params);
    const total = countResult[0].total;

    console.log('Total records:', total);

    // Get paginated data
    const dataSQL = `
      SELECT id, data, added_by, created_at 
      FROM universal_data 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    console.log('Data SQL:', dataSQL, 'Params:', params);
    const [rows] = await connection.execute(dataSQL, params);
    console.log('Query returned rows:', rows.length);

    await connection.end();

    res.json({
      success: true,
      data: rows,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data'
    });
  }
});

// POST /api/data/upload - Upload CSV file
router.post('/upload', isAuthenticated, upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No CSV file provided'
    });
  }

  try {
    const connection = await getConnection();
    await createUniversalTable(connection);

    const results = [];
    const validationErrors = [];
    let rowNumber = 0;

              // Read and parse CSV file
          fs.createReadStream(req.file.path)
            .pipe(csv({
              // Add CSV parser options to handle whitespace
              trim: true,
              skipEmptyLines: true
            }))
            .on('data', (data) => {
        rowNumber++;
        
        // Trim whitespace from all values - be more aggressive
        const trimmedData = {};
        Object.keys(data).forEach(key => {
          // Remove all leading and trailing whitespace, including tabs and newlines
          let value = data[key] || '';
          // First trim normally
          value = value.trim();
          // Then remove any remaining whitespace with regex
          value = value.replace(/^\s+|\s+$/g, '');
          // Also remove any non-breaking spaces or other special whitespace
          value = value.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, '');
          trimmedData[key] = value;
        });
        
        // Basic validation - ensure we have at least one column with data
        const hasData = Object.values(trimmedData).some(value => value && value.trim() !== '');
        if (!hasData) {
          validationErrors.push({
            row: rowNumber,
            data: trimmedData,
            errors: ['Row contains no data']
          });
          return;
        }

        results.push(trimmedData);
      })
      .on('end', async () => {
        try {
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          if (results.length === 0) {
            await connection.end();
            return res.status(400).json({
              success: false,
              error: 'No valid data found in CSV file'
            });
          }

          // Insert data into database
          const addedBy = req.user.id;
          const gridId = req.body.gridId; // Get gridId from request body
          let insertedCount = 0;
          let skippedCount = 0;

          for (const row of results) {
            try {
              const recordId = uuidv4();
              const insertSQL = `
                INSERT INTO universal_data (id, data, added_by, grid_id) 
                VALUES (?, ?, ?, ?)
              `;
              await connection.execute(insertSQL, [recordId, JSON.stringify(row), addedBy, gridId || null]);
              insertedCount++;
            } catch (error) {
              console.error('Error inserting row:', error);
              skippedCount++;
            }
          }

          await connection.end();

          res.json({
            success: true,
            message: `Successfully uploaded ${insertedCount} records`,
            data: {
              totalRecords: results.length,
              insertedCount: insertedCount,
              skippedCount: skippedCount,
              validationErrors: validationErrors
            }
          });

        } catch (error) {
          console.error('Error processing upload:', error);
          await connection.end();
          res.status(500).json({
            success: false,
            error: 'Failed to process uploaded file'
          });
        }
      })
      .on('error', async (error) => {
        console.error('Error reading CSV:', error);
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        await connection.end();
        res.status(500).json({
          success: false,
          error: 'Failed to read CSV file'
        });
      });

  } catch (error) {
    console.error('Error in upload:', error);
    // Clean up uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

// GET /api/data/:id - Get a specific record
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const connection = await getConnection();
    const recordId = req.params.id;
    const addedBy = req.user.id;

    // Get only if the record belongs to the authenticated user
    const selectSQL = 'SELECT * FROM universal_data WHERE id = ? AND added_by = ?';
    const [rows] = await connection.execute(selectSQL, [recordId, addedBy]);

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found or access denied'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch record'
    });
  }
});

// DELETE /api/data/:id - Delete a specific record
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const connection = await getConnection();
    const recordId = req.params.id;
    const addedBy = req.user.id;

    // Delete only if the record belongs to the authenticated user
    const deleteSQL = 'DELETE FROM universal_data WHERE id = ? AND added_by = ?';
    const [result] = await connection.execute(deleteSQL, [recordId, addedBy]);

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete record'
    });
  }
});

module.exports = router; 