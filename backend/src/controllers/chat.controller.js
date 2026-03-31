const Message = require('../models/Message');
const aiService = require('../services/ai.service');
const mongoose = require('mongoose');


exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // 1. Analyze Emotion via Python AI Service
    const emotionData = await aiService.analyzeEmotion(text);

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
    let userMsg;
    try {
      if (mongoose.connection.readyState === 1) {
        userMsg = await Message.create({
          userId,
          sender: 'user',
          content: text,
          emotion: emotionData.emotion,
          emotionScore: emotionData.score
        });
      }
    } catch (err) {
      console.warn("Could not save user message.", err.message);
    }

    // 4. Generate AI Response
    const botReplyText = await aiService.generateChatResponse(text, emotionData.emotion, history);

    // 5. Save Bot Message
    let botMsg;
    try {
      if (mongoose.connection.readyState === 1) {
        botMsg = await Message.create({
          userId,
          sender: 'bot',
          content: botReplyText,
          emotion: 'neutral' 
        });
      }
    } catch (err) {
      console.warn("Could not save bot message.", err.message);
    }

    // 6. Return Data
    res.json({
      userMessage: userMsg || { _id: 'temp1', sender: 'user', content: text, emotion: emotionData.emotion, createdAt: new Date() },
      botResponse: botMsg || { _id: 'temp2', sender: 'bot', content: botReplyText, emotion: 'neutral', createdAt: new Date() }
    });

  } catch (error) {
    console.error('SendMessage Error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
