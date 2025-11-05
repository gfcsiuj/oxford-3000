import type { SentenceExample } from '../types';

async function callProxy(action: string, payload: any) {
    try {
        const response = await fetch('/.netlify/functions/generate-sentences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error calling proxy for action "${action}":`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to communicate with the server. Please check your connection.");
    }
}


export const generateSentences = async (word: string): Promise<SentenceExample[]> => {
    try {
        const sentences = await callProxy('generateSentences', { word });
        return sentences;
    } catch (error) {
        console.error(`Error fetching sentences for "${word}":`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate sentences. Please try again.");
    }
};

export const generateFillBlankSentence = async (word: string): Promise<string> => {
    try {
        const result = await callProxy('generateFillBlankSentence', { word });
        return result.sentence;
    } catch (error) {
        console.error(`Error generating fill-in-the-blank sentence for "${word}":`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate sentence.");
    }
};
