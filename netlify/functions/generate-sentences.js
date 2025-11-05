
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { word } = JSON.parse(event.body);
    if (!word) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing "word" in request body.' }) };
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set on server");
      return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error: API key not found." }) };
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Generate an array of 5 diverse and simple example sentences for the English word "${word}". Each sentence should be suitable for a language learner. For each sentence, also provide its Arabic translation.`
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              sentence: {
                type: "STRING",
                description: "A simple English example sentence."
              },
              translation: {
                type: "STRING",
                description: "The Arabic translation of the sentence."
              }
            },
            required: ["sentence", "translation"]
          }
        }
      }
    };

    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.json().catch(() => ({ error: { message: "Failed to parse Gemini API error response." } }));
      console.error("Gemini API Error:", errorBody);
      throw new Error(errorBody.error?.message || `Gemini API request failed with status ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();
    
    const jsonStr = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonStr) {
      console.error("Invalid response structure from Gemini API:", responseData);
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const sentences = JSON.parse(jsonStr.trim());
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sentences),
    };

  } catch (error) {
    console.error('Error in generate-sentences function:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to generate sentences. ${errorMessage}` }),
    };
  }
};
