// Using CommonJS syntax for Netlify Functions
const { GoogleGenAI } = require("@google/genai");

// This API key is read from the server-side environment variables of the deployment platform (e.g., Netlify)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, payload } = JSON.parse(event.body);

    if (!action || !payload) {
      return { statusCode: 400, body: 'Missing action or payload' };
    }

    let response;
    switch (action) {
      case 'generateSentences': {
        const { word } = payload;
        if (!word) return { statusCode: 400, body: 'Missing "word" in payload' };

        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{
            parts: [{ text: `Generate an array of 5 diverse and simple example sentences for the English word "${word}". Each sentence should be suitable for a language learner. For each sentence, also provide its Arabic translation.` }]
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  sentence: { type: 'STRING', description: "A simple English example sentence." },
                  translation: { type: 'STRING', description: "The Arabic translation of the sentence." }
                },
                required: ["sentence", "translation"]
              }
            }
          }
        });
        
        const jsonStr = response.text.trim();
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: jsonStr,
        };
      }

      case 'generateFillBlankSentence': {
        const { word } = payload;
        if (!word) return { statusCode: 400, body: 'Missing "word" in payload' };

        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                parts: [{ text: `Generate one simple English sentence for a language learner that uses the word "${word}". The sentence must be easy to understand and clearly demonstrate the meaning of the word. Then, replace the word "${word}" in the sentence with "____".` }]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        sentence: { type: 'STRING', description: "The sentence with the word replaced by '____'." },
                    },
                    required: ["sentence"]
                }
            }
        });

        const jsonStr = response.text.trim();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: jsonStr,
        };
      }

      default:
        return { statusCode: 400, body: `Unknown action: ${action}` };
    }

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }),
    };
  }
};

module.exports = { handler };
