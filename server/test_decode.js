const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IktKWkZ6cGVkMWtPMWtmbzZhZWNBTlRQOUlSQzIiLCJlbWFpbCI6InVzYW1hZmlhejExMDRAZ21haWwuY29tIiwibmFtZSI6IlVzYW1hIEZpYXoiLCJpYXQiOjE3NTQxNjIwMzUsImV4cCI6MTc1NDc2NjgzNX0.r_SlFmaQO3RP73O_ZHpTDdbb5RUKjfWSzCQiDIl1W_4';

try {
  const decoded = jwt.verify(token, 'your-jwt-secret-key');
  console.log('Decoded token:', decoded);
  console.log('User ID:', decoded.id);
} catch (error) {
  console.error('Token verification failed:', error);
} 