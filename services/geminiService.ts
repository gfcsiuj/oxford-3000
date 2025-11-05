import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import type { SentenceExample, Word, QuizQuestion } from '../types';

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    if (!process.env.API_KEY) {
      // In a real app, you might want to show a friendly error to the user.
      throw new Error("API_KEY environment variable not set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}


export const generateSentences = async (word: string): Promise<SentenceExample[]> => {
  try {
    const ai = getAI();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        parts: [{ text: `Generate an array of 5 diverse and simple example sentences for the English word "${word}". Each sentence should be suitable for a language learner. For each sentence, also provide its Arabic translation.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING, description: "A simple English example sentence." },
              translation: { type: Type.STRING, description: "The Arabic translation of the sentence." }
            },
            required: ["sentence", "translation"]
          }
        }
      }
    });
    
    const jsonStr = response.text.trim();
    if (!jsonStr) {
      throw new Error("Received an empty response from the AI.");
    }

    const sentences = JSON.parse(jsonStr);
    return sentences;
  } catch (error) {
    console.error(`Error fetching sentences for "${word}":`, error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("Failed to generate sentences. Please check your connection and try again.");
  }
};


export const generateQuizQuestion = (word: Word, otherWords: Word[]): QuizQuestion => {
    // This function can generate the question locally without an API call.
    // It's faster, more reliable, and works offline.
    const options = otherWords
        .filter(w => w.en !== word.en)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.ar)
        .concat(word.ar)
        .sort(() => 0.5 - Math.random());
        
    return {
        question: `ما هو معنى '${word.en}'؟`,
        type: 'multiple-choice-translation',
        options: options,
        answer: word.ar,
        word: word
    };
};
