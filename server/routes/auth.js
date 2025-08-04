const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { generateToken } = require('../config/auth');
const db = require('../database/setup');
const mysql = require('mysql2/promise');

const getConnection = async () => {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bmw_datagrid',
    charset: 'utf8mb4'
  });
};

const { isAuthenticated } = require('../config/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const [existingUsers] = await req.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const crypto = require('crypto');
    const userId = crypto.createHash('md5').update(email).digest('hex');

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    await req.db.execute(
      'INSERT INTO users (id, email, name, password, status) VALUES (?, ?, ?, ?, ?)',
      [userId, email, name, hashedPassword, 'active']
    );

    const user = {
      id: userId,
      email: email,
      name: name
    };

    const token = generateToken(user);

    res.json({
      success: true,
      user: user,
      token: token,
      message: 'Registration successful'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const [users] = await req.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    if (hashedPassword !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await req.db.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['active', user.id]
    );

    const userObj = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    const token = generateToken(userObj);

    res.json({
      success: true,
      user: userObj,
      token: token,
      message: 'Login successful'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});

router.post('/logout', isAuthenticated, async (req, res) => {
  try {
    await req.db.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['inactive', req.user.id]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

router.post('/firebase/verify', async (req, res) => {
  try {
    const { idToken, userData } = req.body;
    
    if (!idToken || !userData) {
      return res.status(400).json({ error: 'ID token and user data are required' });
    }

    const firebaseUser = {
      id: userData.id || `firebase-${Date.now()}`,
      email: userData.email || 'firebase-user@example.com',
      name: userData.name || 'Firebase User'
    };

    const [existingUsers] = await req.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [firebaseUser.email]
    );

    if (existingUsers.length === 0) {
      await req.db.execute(
        'INSERT INTO users (id, email, name, status) VALUES (?, ?, ?, ?)',
        [firebaseUser.id, firebaseUser.email, firebaseUser.name, 'active']
      );
    } else {
      await req.db.execute(
        'UPDATE users SET id = ?, name = ?, status = ? WHERE email = ?',
        [firebaseUser.id, firebaseUser.name, 'active', firebaseUser.email]
      );
    }

    const jwtToken = generateToken(firebaseUser);
    
    res.json({
      success: true,
      user: firebaseUser,
      token: jwtToken,
      message: 'Firebase authentication successful'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Token verification failed',
      details: error.message 
    });
  }
});

router.get('/users/:id', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await req.db.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

router.put('/users/:id', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.params.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const [existingUsers] = await req.db.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await req.db.execute(
      'UPDATE users SET name = ? WHERE id = ?',
      [name.trim(), userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: name.trim()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

module.exports = router; 