const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

module.exports = generateToken;

