const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { generateToken } = require('../config/auth');
const db = require('../database/setup');
const mysql = require('mysql2/promise');

// Database connection
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

// Manual registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const [existingUsers] = await req.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create user ID (hash of email for consistency)
    const crypto = require('crypto');
    const userId = crypto.createHash('md5').update(email).digest('hex');

    // Hash password (in production, use bcrypt)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Insert new user into database with active status
    await req.db.execute(
      'INSERT INTO users (id, email, name, password, status) VALUES (?, ?, ?, ?, ?)',
      [userId, email, name, hashedPassword, 'active']
    );

    // Create user object for JWT
    const user = {
      id: userId,
      email: email,
      name: name
    };

    // Generate JWT token
    const token = generateToken(user);

    console.log('✅ User registered successfully:', user);

    res.json({
      success: true,
      user: user,
      token: token,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('❌ Registration failed:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// Manual login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Find user in database
    const [users] = await req.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Hash the provided password and compare with stored hash
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    if (hashedPassword !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update user status to active
    await req.db.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['active', user.id]
    );

    // Create user object for JWT
    const userObj = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Generate JWT token
    const token = generateToken(userObj);

    console.log('✅ User logged in successfully:', userObj);

    res.json({
      success: true,
      user: userObj,
      token: token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('❌ Login failed:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});



// Logout route
router.post('/logout', isAuthenticated, async (req, res) => {
  try {
    // Update user status to inactive
    await req.db.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['inactive', req.user.id]
    );

    console.log('✅ User logged out successfully:', req.user.id);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout failed:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user info
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Firebase token verification endpoint
router.post('/firebase/verify', async (req, res) => {
  try {
    const { idToken, userData } = req.body;
    
    if (!idToken || !userData) {
      return res.status(400).json({ error: 'ID token and user data are required' });
    }

    console.log('🔍 Verifying Firebase ID token...');
    console.log('📧 User data from frontend:', userData);
    
    // Extract user information from the frontend userData
    const firebaseUser = {
      id: userData.id || `firebase-${Date.now()}`,
      email: userData.email || 'firebase-user@example.com',
      name: userData.name || 'Firebase User'
    };

    console.log('✅ Firebase user data extracted:', firebaseUser);

    // Check if user exists in database by email
    const [existingUsers] = await req.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [firebaseUser.email]
    );

    if (existingUsers.length === 0) {
      // Create new user in database
      console.log('👤 Creating new user in database...');
      await req.db.execute(
        'INSERT INTO users (id, email, name, status) VALUES (?, ?, ?, ?)',
        [firebaseUser.id, firebaseUser.email, firebaseUser.name, 'active']
      );
      console.log('✅ New user created in database:', firebaseUser.id);
    } else {
      console.log('✅ User already exists in database with email:', firebaseUser.email);
      // Update existing user with new Firebase ID and set status to active
      await req.db.execute(
        'UPDATE users SET id = ?, name = ?, status = ? WHERE email = ?',
        [firebaseUser.id, firebaseUser.name, 'active', firebaseUser.email]
      );
      console.log('✅ Updated existing user with new Firebase ID:', firebaseUser.id);
    }

    // Generate JWT token
    const jwtToken = generateToken(firebaseUser);
    
    console.log('✅ Firebase token verification successful:', firebaseUser);
    
    res.json({
      success: true,
      user: firebaseUser,
      token: jwtToken,
      message: 'Firebase authentication successful'
    });

  } catch (error) {
    console.error('❌ Firebase token verification failed:', error);
    res.status(500).json({ 
      error: 'Token verification failed',
      details: error.message 
    });
  }
});

// Get user by ID
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
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// Update user profile
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

    // Check if user exists and is the same user
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

    // Update user name
    await req.db.execute(
      'UPDATE users SET name = ? WHERE id = ?',
      [name.trim(), userId]
    );

    console.log('✅ User profile updated successfully:', { id: userId, name: name.trim() });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: name.trim()
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

module.exports = router; 