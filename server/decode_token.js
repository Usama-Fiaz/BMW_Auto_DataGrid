const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFiMjBiZDA1NmQ3OTliZjZmM2ZlY2IxNGU5N2MxOTgyIiwiZW1haWwiOiJ1c2FtYWZpYXoxMTA0QGdtYWlsLmNvbSIsIm5hbWUiOiJVc2FtYSBGaWF6IiwiaWF0IjoxNzU0MTYyMjEzLCJleHAiOjE3NTQ3NjcwMTN9.xneT96YygyPIFlNw7VQBqQSe8myMnpypt8WhXaj7gK4';

try {
  const decoded = jwt.verify(token, 'your-jwt-secret-key');
  console.log('Decoded token:', decoded);
  console.log('User ID:', decoded.id);
} catch (error) {
  console.error('Token verification failed:', error);
} 