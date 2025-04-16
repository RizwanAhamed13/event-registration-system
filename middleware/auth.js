const jwt = require('jsonwebtoken');
require('dotenv').config();

// ✅ Token Checker with Debug Logs
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  console.log("🔐 Token received:", token); // ✅ Add this line to see the token

  if (!token) {
    console.log("❌ No token provided"); // Optional
    return res.status(403).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Token verified. User ID:", decoded.id, "| Role:", decoded.role); // ✅ Log decoded token
    next();
  } catch (err) {
    console.log("❌ JWT Error:", err.message); // ✅ Log JWT error
    return res.status(403).json({ msg: 'Invalid token' });
  }
};

// ✅ Role Checker
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      console.log(`❌ Access denied for role: ${req.user.role}. Required: ${role}`);
      return res.status(403).json({ msg: 'Access denied' });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };