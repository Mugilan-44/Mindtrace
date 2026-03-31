const axios = require('axios');
const OpenAI = require('openai');

// Initialize OpenAI (Compatible with Mistral API)
const openai = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

async function analyzeEmotion(text) {
  try {
    const response = await axios.post(`${FASTAPI_URL}/api/v1/analyze-emotion`, { text });
    return response.data; // { emotion: 'joy', score: 0.95 }
  } catch (error) {
    console.error('Error hitting FastAPI emotion model:', error.message);
    // Fallback if AI service is down
    return { emotion: 'neutral', score: 0.0 };
  }
}

async function generateChatResponse(userMessage, userEmotion, chatHistory) {
  // Construct context
  let historyText = chatHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'MindTrace'}: ${msg.content}`).join('\n');
  
  const prompt = `
You are MindTrace, an empathetic mental health AI chatbot.
You provide supportive, insightful, and safe conversational support.
The user's currently detected emotion is: ${userEmotion}.

Recent Chat History:
${historyText}

Respond naturally and empathetically to the user's message considering their current emotion. Keep it concise, helpful, and supportive.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userMessage }
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating OpenAI response:', error.message);
    return "I'm having a little trouble connecting to my thoughts right now, but I hear you. Please give me a moment.";
  }
}

module.exports = {
  analyzeEmotion,
  generateChatResponse
};
