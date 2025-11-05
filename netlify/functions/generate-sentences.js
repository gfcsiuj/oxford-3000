import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@1.28.0";

/**
 * @typedef {Object} SentenceExample
 * @property {string} sentence
 * @property {string} translation
 */

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
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate an array of 10 diverse and simple example sentences for the English word "${word}". Each sentence should be suitable for a language learner. For each sentence, also provide its Arabic translation.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sentence: {
                            type: Type.STRING,
                            description: "A simple English example sentence."
                        },
                        translation: {
                            type: Type.STRING,
                            description: "The Arabic translation of the sentence."
                        }
                    },
                    required: ["sentence", "translation"],
                    propertyOrdering: ["sentence", "translation"],
                }
            }
        }
    });

    const jsonStr = response.text.trim();
    if (!jsonStr) {
      throw new Error("Received empty response from API");
    }
    
    /** @type {SentenceExample[]} */
    const sentences = JSON.parse(jsonStr);
    
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
      body: JSON.stringify({ error: `Failed to generate sentences from AI. ${errorMessage}` }),
    };
  }
};
