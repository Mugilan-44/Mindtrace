const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Chat routes (Protected)
router.post('/message', protect, chatController.sendMessage);
router.get('/history', protect, chatController.getChatHistory);

module.exports = router;
