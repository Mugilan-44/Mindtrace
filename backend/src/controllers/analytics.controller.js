const Message = require('../models/Message');
const mongoose = require('mongoose');

const POSITIVE_EMOTIONS = ['joy', 'surprise'];
const NEGATIVE_EMOTIONS = ['sadness', 'anger', 'fear', 'disgust'];

exports.getMentalWrap = async (req, res) => {
  try {
    const { timeframe } = req.params;
    const userId = req.user.id; 

    if (mongoose.connection.readyState !== 1) {
       return res.status(503).json({ error: "Database not connected. Please start MongoDB." });
    }

    const endDate = new Date();
    const startDate = new Date();
    if (timeframe === 'monthly') {
      startDate.setDate(endDate.getDate() - 30);
    } else {
      startDate.setDate(endDate.getDate() - 7);
    }

    const userMessages = await Message.find({
      userId,
      sender: 'user',
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: 1 });

    if (userMessages.length === 0) {
      return res.json({
         dominantEmotion: 'neutral',
         emotionTrends: {},
         positiveToNegativeRatio: 0,
         aiSummary: "You haven't chatted enough this period. Drop a message to get started!",
         suggestions: ["Send your first message to MindTrace to start tracking your mood."],
         timeline: [],
         messageCount: 0
      });
    }

    const emotionCounts = {};
    let positiveCount = 0;
    let negativeCount = 0;

    // Timeline processing map
    const timelineMap = {};

    userMessages.forEach(msg => {
      const em = msg.emotion || 'neutral';
      emotionCounts[em] = (emotionCounts[em] || 0) + 1;
      
      if (POSITIVE_EMOTIONS.includes(em)) positiveCount++;
      if (NEGATIVE_EMOTIONS.includes(em)) negativeCount++;

      // Build timeline: Group by YYYY-MM-DD
      const dateKey = msg.createdAt.toISOString().split('T')[0];
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { date: dateKey };
      }
      timelineMap[dateKey][em] = (timelineMap[dateKey][em] || 0) + 1;
    });

    // Format Timeline for Recharts
    const timeline = Object.values(timelineMap);

    let dominantEmotion = 'neutral';
    let maxCount = -1;
    for (const [em, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = em;
      }
    }

    const positiveToNegativeRatio = positiveCount / (negativeCount || 1);

    // Rule-Based Insight Generator
    let aiSummary = "Your mood seems stable overall.";
    if (negativeCount > positiveCount) {
      aiSummary = "You've been experiencing some stress and negative emotions frequently this week.";
    } else if (positiveCount > negativeCount * 2) {
      aiSummary = "You've had a very positive and joyful week! Keep up the great energy.";
    } else if (dominantEmotion === 'neutral') {
       aiSummary = "Your emotions have remained primarily neutral and balanced over this period.";
    }

    // Rule-Based Suggestions Generator
    let suggestions = [];
    switch (dominantEmotion) {
      case 'sadness':
        suggestions = ["Try writing your thoughts in a journal.", "Reach out to a close friend or family member for a chat.", "Watch a comforting movie."];
        break;
      case 'anxious':
      case 'fear':
        suggestions = ["Practice 4-4-4 box breathing exercises.", "Try to step away from screens for 20 minutes.", "Focus on things within your immediate control."];
        break;
      case 'anger':
        suggestions = ["Do a quick physical workout to release tension.", "Step away from frustrating tasks and take a walk.", "Try counting to 10 before reacting."];
        break;
      case 'stressed':
        suggestions = ["Break your big tasks into smaller, manageable steps.", "Listen to calming lo-fi music.", "Make sure you're getting 8 hours of sleep."];
        break;
      case 'joy':
      case 'surprise':
        suggestions = ["Share your positive energy with someone else!", "Note down what made you happy today.", "Tackle a creative project."];
        break;
      default:
        suggestions = ["Take a 5-minute stretching break.", "Stay hydrated throughout the day.", "Take a moment to practice mindfulness."];
        break;
    }

    res.json({
       reportType: timeframe,
       periodStartDate: startDate,
       periodEndDate: endDate,
       dominantEmotion,
       emotionTrends: emotionCounts,
       positiveToNegativeRatio,
       aiSummary,
       suggestions,
       timeline,
       messageCount: userMessages.length
    });

  } catch (error) {
    console.error('Mental Wrap Generation Error:', error);
    res.status(500).json({ error: 'Internal server error while generating wrap.' });
  }
};
