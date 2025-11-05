import type { SentenceExample } from '../types';

export const generateSentences = async (word: string): Promise<SentenceExample[]> => {
  try {
    const response = await fetch('/.netlify/functions/generate-sentences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const sentences: SentenceExample[] = await response.json();
    return sentences;
  } catch (error) {
    console.error(`Error fetching sentences for "${word}":`, error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("Failed to generate sentences. Please check your connection and try again.");
  }
};
