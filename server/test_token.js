const jwt = require('jsonwebtoken');

const user = {
  id: 'KJZFzped1kO1kfo6aecANTP9IRC2',
  email: 'usamafiaz1104@gmail.com',
  name: 'Usama Fiaz'
};

const token = jwt.sign(user, 'your-jwt-secret-key', { expiresIn: '7d' });
console.log('JWT Token:', token); 