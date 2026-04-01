const Message = require('../models/Message');
const aiService = require('../services/ai.service');
const mongoose = require('mongoose');


exports.sendMessage = async (req, res) => {
  try {
    console.log("🔥 CHAT HIT:", req.body);

    const message = req.body?.message || req.body?.text;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message text is required" });
    }

    console.log("✅ MESSAGE RECEIVED:", message);

    const userId = req.user.id;

    // 1. Analyze Emotion via Python AI Service (now Mistral LLM)
    const emotionData = await aiService.analyzeEmotion(message);
    
    const emotion = emotionData.emotion;
    const score = emotionData.score;
    
    console.log("🧠 DETECTED EMOTION:", emotion, score);

    // 2. Fetch Chat History for Context (last 10 messages)
    let history = [];
    try {
      if (mongoose.connection.readyState === 1) {
        history = await Message.find({ userId })
          .sort({ createdAt: -1 })
          .limit(10);
        history = history.reverse(); // Chronological order
      }
    } catch (err) {
      console.warn("Could not fetch history", err.message);
    }
    
    // 3. Save User Message
    const userMsg = await Message.create({
      userId,
      sender: 'user',
      content: message,
      emotion,
      emotionScore: score
    });

    // 4. Generate AI Response
    const botReplyText = await aiService.generateChatResponse(message, emotion, history);

    // Optional: Detect the Bot's own generated emotion!
    const botEmotionData = await aiService.analyzeEmotion(botReplyText);

    // 5. Save Bot Message
    const botMsg = await Message.create({
      userId,
      sender: 'bot',
      content: botReplyText,
      emotion: botEmotionData.emotion,
      emotionScore: botEmotionData.score
    });

    // 6. Return Data
    res.json({
      success: true,
      userMessage: userMsg,
      botResponse: botMsg
    });

  } catch (error) {
    console.error('❌ CHAT ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const history = await Message.find({ userId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (error) {
    console.error('GetChatHistory Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
