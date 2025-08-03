const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');

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
const { isAuthenticated } = require('../config/auth');

const router = express.Router();

// Configure multer for CSV uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Create a new grid with CSV data
router.post('/create', isAuthenticated, upload.single('csvFile'), async (req, res) => {
  let connection;
  
  try {
    const { name, gridId: existingGridId, isReplacement } = req.body;
    const gridId = existingGridId || uuidv4();
    const addedBy = req.user.id;

    if (!name || !req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Grid name and CSV file are required' 
      });
    }

    connection = await getConnection();

    // If this is a replacement, delete all existing data for this grid
    if (isReplacement === 'true' && existingGridId) {
      await connection.execute(
        'DELETE FROM universal_data WHERE grid_id = ? AND added_by = ?',
        [existingGridId, addedBy]
      );
    }

    // Create the grid record only if it doesn't exist
    if (!existingGridId) {
      await connection.execute(
        'INSERT INTO user_grids (id, name, added_by) VALUES (?, ?, ?)',
        [gridId, name, addedBy]
      );
    }

    // Parse CSV and insert data
    const csvResults = [];
    let csvColumnOrder = [];
    let isFirstRow = true;
    
    // Use a Promise to handle the CSV parsing
    const parseCSV = new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv({ trim: true, skipEmptyLines: true }))
        .on('data', (data) => {
          // Store column order from first row
          if (isFirstRow) {
            csvColumnOrder = Object.keys(data);
            isFirstRow = false;
          }
          
          // Clean the data by trimming all values
          const cleanedData = {};
          csvColumnOrder.forEach(key => {
            cleanedData[key] = data[key] ? data[key].trim() : '';
          });
          csvResults.push(cleanedData);
        })
        .on('end', () => resolve({ results: csvResults, columnOrder: csvColumnOrder }))
        .on('error', (error) => reject(error));
    });

    // Wait for CSV parsing to complete
    const { results, columnOrder } = await parseCSV;

    // Insert all rows into universal_data with grid_id
    for (const row of results) {
      const recordId = uuidv4();
      await connection.execute(
        'INSERT INTO universal_data (id, data, added_by, grid_id) VALUES (?, ?, ?, ?)',
        [recordId, JSON.stringify(row), addedBy, gridId]
      );
    }

    // Store column order in user_grids table
    await connection.execute(
      'UPDATE user_grids SET column_order = ? WHERE id = ?',
      [JSON.stringify(columnOrder), gridId]
    );

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    const message = isReplacement === 'true' 
      ? 'Grid data replaced successfully' 
      : 'Grid created successfully';

    res.json({
      success: true,
      message,
      gridId,
      recordsInserted: results.length
    });

  } catch (error) {
    console.error('Error creating grid:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create grid' 
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Get all grids for the authenticated user
router.get('/', isAuthenticated, async (req, res) => {
  const connection = await getConnection();
  
  try {
    const [rows] = await connection.execute(
      `SELECT id, name, created_at, column_order,
       (SELECT COUNT(*) FROM universal_data WHERE grid_id = user_grids.id) as record_count
       FROM user_grids 
       WHERE added_by = ? 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      grids: rows
    });
  } catch (error) {
    console.error('Error fetching grids:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch grids' 
    });
  } finally {
    await connection.end();
  }
});

// Update grid name
router.put('/:id', isAuthenticated, async (req, res) => {
  const connection = await getConnection();
  
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Grid name is required' 
      });
    }

    const [result] = await connection.execute(
      'UPDATE user_grids SET name = ? WHERE id = ? AND added_by = ?',
      [name.trim(), req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Grid not found' 
      });
    }

    res.json({
      success: true,
      message: 'Grid name updated successfully'
    });
  } catch (error) {
    console.error('Error updating grid:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update grid' 
    });
  } finally {
    await connection.end();
  }
});

// Get grid details by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  const connection = await getConnection();
  
  try {
    const [rows] = await connection.execute(
      'SELECT id, name, created_at FROM user_grids WHERE id = ? AND added_by = ?',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Grid not found' 
      });
    }

    res.json({
      success: true,
      grid: rows[0]
    });
  } catch (error) {
    console.error('Error fetching grid:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch grid' 
    });
  } finally {
    await connection.end();
  }
});

// Delete a grid and all its data
router.delete('/:id', isAuthenticated, async (req, res) => {
  const connection = await getConnection();
  
  try {
    // Delete all data associated with this grid
    await connection.execute(
      'DELETE FROM universal_data WHERE grid_id = ? AND added_by = ?',
      [req.params.id, req.user.id]
    );

    // Delete the grid
    const [result] = await connection.execute(
      'DELETE FROM user_grids WHERE id = ? AND added_by = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Grid not found' 
      });
    }

    res.json({
      success: true,
      message: 'Grid deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grid:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete grid' 
    });
  } finally {
    await connection.end();
  }
});

module.exports = router; 