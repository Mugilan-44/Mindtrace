const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'system', 'bot'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  emotion: {
    type: String,
    default: 'neutral'
  },
  emotionScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
