const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Create database connection pool
const pool = mysql.createPool({
  host: '127.0.0.1', // Force IPv4
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bmw_datagrid',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    req.db = connection;
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Middleware to release database connections
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (req.db) {
      req.db.release();
    }
    originalSend.call(this, data);
  };
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data')); // Universal data route
app.use('/api/grids', require('./routes/grids')); // Grid management routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
