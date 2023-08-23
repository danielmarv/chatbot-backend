
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Define automated scenarios and their responses
const automatedScenarios = [
  {
    keywords: ['current air quality', 'temperature', 'weather'],
    response: 'Automated AI response for weather-related queries.',
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    response: 'Hello! How can I assist you today?',
  },
  {
    keywords: ['forgot password', 'reset password','hello'],
    response: 'To reset your password, please follow these steps: [click on the Forgot password link,].',
  },
  // Add more automated scenarios as needed
];

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const matchedScenario = automatedScenarios.find(scenario =>
      scenario.keywords.some(keyword => userMessage.toLowerCase().includes(keyword))
    );

    let botResponse;

    if (matchedScenario) {
      botResponse = matchedScenario.response;
    } else {
      // Send user message to OpenAI API for complex queries
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          model: 'gpt-3.5-turbo',
        }),
      });

      const responseData = await openaiResponse.json();
      if (responseData.choices && responseData.choices.length > 0) {
        const aiGeneratedResponse = responseData.choices[0].text;
      
        // Determine your threshold value (e.g., 30 characters)
        const YOUR_THRESHOLD_VALUE = 30;
      
        if (aiGeneratedResponse.length <= YOUR_THRESHOLD_VALUE) {
          // Notify for human intervention
          botResponse = "I'm sorry, but I'm unable to provide a complete answer to your question. Let me get a human expert to assist you.";
          // You can also consider sending a notification to your support team here
        } else {
          botResponse = aiGeneratedResponse;
        }
      } else {
        // Handle the case where responseData.choices is empty or undefined
        botResponse = "I'm sorry, but I'm currently unable to provide an answer. Let me get a human expert to assist you.";
      }
    }

    res.json({ botResponse });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'An error occurred while processing the message.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
