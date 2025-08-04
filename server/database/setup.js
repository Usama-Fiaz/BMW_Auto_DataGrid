const mysql = require('mysql2/promise');
require('dotenv').config();

const createTables = async () => {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);

    await connection.execute(`
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
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_grids (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        added_by VARCHAR(255) NOT NULL,
        column_order JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_added_by (added_by)
      )
    `);

    try {
      await connection.execute(`
        ALTER TABLE user_grids ADD COLUMN column_order JSON DEFAULT NULL
      `);
      console.log('Column order column added to user_grids table');
    } catch (error) {
      console.log('Column order column might already exist');
    }

    console.log('✅ Database tables created/updated successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await connection.end();
  }
};

createTables(); 