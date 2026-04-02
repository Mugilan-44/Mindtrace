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
const allowedOrigins = [
  "http://localhost:5173",
  "https://mindtrace-ten.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("🌐 Incoming Origin:", origin);
    
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow ALL vercel preview deployments
    if (origin && origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
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
console.log("🔥 REGISTERING ROUTES");

// Mount routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// Health check (for Render)
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Debug test
app.get('/api/debug', (req, res) => {
  res.json({ success: true, message: "Debug route explicitly reached" });
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