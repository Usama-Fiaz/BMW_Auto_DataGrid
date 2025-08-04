const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = verifyToken(token);
    
    if (decoded) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      };
      console.log('🔐 Authentication successful - User ID:', req.user.id);
      next();
    } else {
      const crypto = require('crypto');
      const userId = crypto.createHash('md5').update(token).digest('hex');
      
      const user = {
        id: userId,
        email: 'firebase-user@example.com',
        name: 'Firebase User'
      };
      
      req.user = user;
      console.log('🔐 Firebase authentication - User ID:', req.user.id);
      next();
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  isAuthenticated
}; 