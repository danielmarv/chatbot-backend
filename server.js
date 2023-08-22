const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Define automated scenarios and their responses
const automatedScenarios = [
  {
    keywords: ['current air quality', 'temperature', 'weather'],
    response: 'Automated AI response for weather-related queries.',
  },
  {
    keywords: ['forgot password', 'reset password'],
    response: 'To reset your password, please follow these steps: [Provide steps here].',
  },
  // Add more automated scenarios as needed
];

// Handle incoming messages from frontend
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Check if the user message matches any automated scenario
    const matchedScenario = automatedScenarios.find(scenario =>
      scenario.keywords.some(keyword => userMessage.toLowerCase().includes(keyword))
    );

    let botResponse;

    if (matchedScenario) {
      // Use automated response for matched scenario
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
        }),
      });

      const responseData = await openaiResponse.json();
      botResponse = responseData.choices[0].message.content;
    }

    // Send bot's response to frontend
    res.json({ botResponse });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'An error occurred while processing the message.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});