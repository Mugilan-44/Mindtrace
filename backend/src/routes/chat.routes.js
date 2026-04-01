const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

console.log("🔥 CHAT ROUTES LOADED");

// Chat routes (Protected)
router.post('/', protect, chatController.sendMessage);
router.get('/history', protect, chatController.getChatHistory);

module.exports = router;
