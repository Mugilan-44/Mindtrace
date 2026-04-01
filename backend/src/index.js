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

// ==================== ROUTES ====================

// Import routes explicitly (important for production)
const authRoutes = require('./routes/auth.routes.js');
const chatRoutes = require('./routes/chat.routes.js');
const analyticsRoutes = require('./routes/analytics.routes.js');

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