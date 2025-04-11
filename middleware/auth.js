const jwt = require('jsonwebtoken');
require('dotenv').config();

// ✅ Token Checker
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).json({ msg: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ msg: 'Invalid token' });
  }
};

// ✅ Role Checker
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role)
      return res.status(403).json({ msg: 'Access denied' });
    next();
  };
};

module.exports = { verifyToken, requireRole };