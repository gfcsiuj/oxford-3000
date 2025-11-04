import { GoogleGenAI, Type } from "@google/genai";
import type { SentenceExample } from '../types';

export const generateSentences = async (word: string): Promise<SentenceExample[]> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
                    // Following the guideline example to include propertyOrdering
                    propertyOrdering: ["sentence", "translation"],
                }
            }
        }
    });

    const jsonStr = response.text.trim();
    if (!jsonStr) {
        throw new Error("Received empty response from API");
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Error generating sentences for "${word}":`, error);
    throw new Error("Failed to generate sentences from AI. Please try again.");
  }
};
