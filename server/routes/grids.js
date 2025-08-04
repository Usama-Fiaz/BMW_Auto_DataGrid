const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');

const getConnection = async () => {
  return mysql.createConnection({
    host: '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bmw_datagrid',
    charset: 'utf8mb4'
  });
};
const { isAuthenticated } = require('../config/auth');

const router = express.Router();

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

    if (isReplacement === 'true' && existingGridId) {
      await connection.execute(
        'DELETE FROM universal_data WHERE grid_id = ? AND added_by = ?',
        [existingGridId, addedBy]
      );
    }

    if (!existingGridId) {
      await connection.execute(
        'INSERT INTO user_grids (id, name, added_by) VALUES (?, ?, ?)',
        [gridId, name, addedBy]
      );
    }

    const csvResults = [];
    let csvColumnOrder = [];
    let isFirstRow = true;
    
    const parseCSV = new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv({ trim: true, skipEmptyLines: true }))
        .on('data', (data) => {
          if (isFirstRow) {
            csvColumnOrder = Object.keys(data);
            isFirstRow = false;
          }
          
          const cleanedData = {};
          csvColumnOrder.forEach(key => {
            cleanedData[key] = data[key] ? data[key].trim() : '';
          });
          csvResults.push(cleanedData);
        })
        .on('end', () => resolve({ results: csvResults, columnOrder: csvColumnOrder }))
        .on('error', (error) => reject(error));
    });

    const { results, columnOrder } = await parseCSV;

    for (const row of results) {
      const recordId = uuidv4();
      await connection.execute(
        'INSERT INTO universal_data (id, data, added_by, grid_id) VALUES (?, ?, ?, ?)',
        [recordId, JSON.stringify(row), addedBy, gridId]
      );
    }

    await connection.execute(
      'UPDATE user_grids SET column_order = ? WHERE id = ?',
      [JSON.stringify(columnOrder), gridId]
    );

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
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch grids' 
    });
  } finally {
    await connection.end();
  }
});

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
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update grid' 
    });
  } finally {
    await connection.end();
  }
});

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
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch grid' 
    });
  } finally {
    await connection.end();
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.execute(
      'DELETE FROM universal_data WHERE grid_id = ? AND added_by = ?',
      [req.params.id, req.user.id]
    );

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
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete grid' 
    });
  } finally {
    await connection.end();
  }
});

module.exports = router; 