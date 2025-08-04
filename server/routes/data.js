const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const { isAuthenticated } = require('../config/auth');
const router = express.Router();

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
    fileSize: 10 * 1024 * 1024
  }
});

const getConnection = async () => {
  return mysql.createConnection({
    host: '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bmw_datagrid',
    charset: 'utf8mb4'
  });
};

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
  } catch (error) {
    throw error;
  }
};

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const connection = await getConnection();
    await createUniversalTable(connection);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const gridId = req.query.gridId;
    const addedBy = req.user.id;



    let whereClause = 'WHERE added_by = ?';
    const params = [addedBy];

    if (gridId) {
      whereClause += ' AND grid_id = ?';
      params.push(gridId);
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();

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

    }

    const filterConditions = [];
    const fieldFilters = {};
    const fieldLogic = {};
    
    Object.keys(req.query).forEach(key => {
      if (key.includes('_') && !['page', 'limit', 'search', 'gridId'].includes(key)) {
        const lastUnderscoreIndex = key.lastIndexOf('_');
        if (lastUnderscoreIndex === -1) return;
        
        let field = key.substring(0, lastUnderscoreIndex);
        let operator = key.substring(lastUnderscoreIndex + 1);
        const value = req.query[key];
        
        const validOperators = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'];
        
        if (!validOperators.includes(operator)) {
          for (const validOp of validOperators) {
            if (key.includes(validOp)) {
              const operatorIndex = key.indexOf(validOp);
              field = key.substring(0, operatorIndex - 1);
              operator = validOp;
              break;
            }
          }
        }
        
        if (value !== undefined && value !== '') {
          if (!fieldFilters[field]) {
            fieldFilters[field] = [];
          }
          
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
              return;
          }
          
          if (condition) {
            fieldFilters[field].push({ condition, params: filterParams });
          }
        }
      }
    });
    
    Object.keys(fieldFilters).forEach(field => {
      const fieldConditions = fieldFilters[field];
      if (fieldConditions.length === 1) {
        filterConditions.push(fieldConditions[0].condition);
        params.push(...fieldConditions[0].params);
      } else if (fieldConditions.length > 1) {
        const logic = fieldLogic[field] || 'OR';
        const logicConditions = fieldConditions.map(fc => fc.condition);
        const logicParams = fieldConditions.flatMap(fc => fc.params);
        filterConditions.push(`(${logicConditions.join(` ${logic} `)})`);
        params.push(...logicParams);
      }
    });
    
    if (filterConditions.length > 0) {
      whereClause += ' AND ' + filterConditions.join(' AND ');
    }

    const countSQL = `SELECT COUNT(*) as total FROM universal_data ${whereClause}`;
    const [countResult] = await connection.execute(countSQL, params);
    const total = countResult[0].total;

    const dataSQL = `
      SELECT id, data, added_by, created_at 
      FROM universal_data 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [rows] = await connection.execute(dataSQL, params);

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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data'
    });
  }
});

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

          fs.createReadStream(req.file.path)
            .pipe(csv({
              trim: true,
              skipEmptyLines: true
            }))
            .on('data', (data) => {
        rowNumber++;
        
        const trimmedData = {};
        Object.keys(data).forEach(key => {
          let value = data[key] || '';
          value = value.trim();
          value = value.replace(/^\s+|\s+$/g, '');
          value = value.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, '');
          trimmedData[key] = value;
        });
        
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
          fs.unlinkSync(req.file.path);

          if (results.length === 0) {
            await connection.end();
            return res.status(400).json({
              success: false,
              error: 'No valid data found in CSV file'
            });
          }

          const addedBy = req.user.id;
          const gridId = req.body.gridId;
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
          await connection.end();
          res.status(500).json({
            success: false,
            error: 'Failed to process uploaded file'
          });
        }
      })
      .on('error', async (error) => {
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
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const connection = await getConnection();
    const recordId = req.params.id;
    const addedBy = req.user.id;

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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch record'
    });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const connection = await getConnection();
    const recordId = req.params.id;
    const addedBy = req.user.id;

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
    res.status(500).json({
      success: false,
      error: 'Failed to delete record'
    });
  }
});

module.exports = router; 