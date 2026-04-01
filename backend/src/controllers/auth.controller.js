const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
exports.signup = (req, res) => {
  console.log("🔥 SIGNUP HIT");
  res.json({ message: "Signup working" });
};

// @route   POST /api/auth/login
// @desc    Authenticate a user
// @access  Public
exports.login = (req, res) => {
  console.log("🔥 LOGIN HIT");
  res.json({ message: "Login working" });
};
