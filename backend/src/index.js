require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Initialize app
const app = express();

// Connect Database
connectDB();

// ==================== MIDDLEWARE ====================

// CORS (allow frontend)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(helmet());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  console.log("📦 Headers:", req.headers['content-type']);
  next();
});

// ==================== ROUTES ====================

// Import routes explicitly (important for production)
const path = require('path');
const authRoutes = require(path.join(__dirname, 'routes', 'auth.routes.js'));
const chatRoutes = require(path.join(__dirname, 'routes', 'chat.routes.js'));
const analyticsRoutes = require(path.join(__dirname, 'routes', 'analytics.routes.js'));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check (for Render)
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Optional root route (for browser testing)
app.get('/', (req, res) => {
  res.send('MindTrace Backend Running 🚀');
});

// ==================== SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});