const Message = require('../models/Message');
const aiService = require('../services/ai.service');
const mongoose = require('mongoose');


exports.sendMessage = async (req, res) => {
  try {
    console.log("🔥 BODY:", req.body);
    console.log("👤 USER:", req.user);

    const message = req.body?.message || req.body?.text;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message text is required"
      });
    }

    const userId = req.user?.id || null;

    let emotion = "neutral";
    let emotionScore = 0;
    
    try {
      const emotionData = await aiService.analyzeEmotion(message);
      emotion = emotionData?.emotion || "neutral";
      emotionScore = emotionData?.score || 0;
    } catch (err) {
      console.warn("Emotion detection failed, using fallback.", err.message);
    }
    
    console.log("🧠 DETECTED EMOTION:", emotion, emotionScore);

    // Fetch Chat History for Context
    let history = [];
    try {
      if (mongoose.connection.readyState === 1 && userId) {
        history = await Message.find({ userId }).sort({ createdAt: -1 }).limit(10);
        history = history.reverse(); 
      }
    } catch (err) {
      console.warn("Could not fetch history", err.message);
    }
    
    // Save User Message Safely
    const savedUserMessage = await Message.create({
      userId,
      sender: "user",
      content: message,
      emotion,
      emotionScore
    });

    // Generate Bot Response Safely
    let botReply = "I am experiencing temporary connection issues, but I'm here for you. How are you feeling?";
    try {
      const reply = await aiService.generateChatResponse(message, emotion, history);
      botReply = reply || botReply;
    } catch (err) {
      console.warn("AI Generation failed, using fallback.", err.message);
    }

    // Save Bot Message Safely (Hardcode emotion to save 1 full LLM API roundtrip latency!)
    const savedBotMessage = await Message.create({
      userId,
      sender: "bot",
      content: botReply,
      emotion: "neutral",
      emotionScore: 0
    });

    // Return consistent response
    res.json({
      success: true,
      userMessage: savedUserMessage,
      botResponse: savedBotMessage
    });

  } catch (error) {
    console.error("❌ CHAT ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server error"
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
