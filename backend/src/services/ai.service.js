const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

async function analyzeEmotion(text) {
  const prompt = `You are an emotion detection system.

Analyze the user's message and return ONLY valid JSON:
{
"emotion": "<one of: happy, sad, anxious, angry, neutral>",
"score": <number between 0 and 1>
}

Message:
${text}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }]
    });

    const content = completion.choices[0].message.content.trim();
    
    // Attempt to extract JSON safely from potential markdown blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    const parsed = JSON.parse(jsonStr);
    
    return {
      emotion: parsed.emotion ? parsed.emotion.toLowerCase() : 'neutral',
      score: parsed.score || 0
    };
  } catch (error) {
    console.error('Error hitting Mistral emotion classification:', error.message);
    return { emotion: 'neutral', score: 0 };
  }
}

async function generateChatResponse(userMessage, userEmotion, chatHistory) {
  const prompt = `You are a supportive mental health assistant.
User emotion: ${userEmotion}
User message: ${userMessage}

Respond empathetically and helpfully.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: prompt }
      ]
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating Mistral chat response:', error.message);
    return "I am currently having trouble connecting, but I am here for you. Take a deep breath.";
  }
}

module.exports = {
  analyzeEmotion,
  generateChatResponse
};
