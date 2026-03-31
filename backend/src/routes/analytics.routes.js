const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

// Generate and return mental wrap dashboard metrics (Protected)
router.get('/wrap/:timeframe', protect, analyticsController.getMentalWrap);

module.exports = router;
