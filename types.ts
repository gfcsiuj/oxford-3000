export interface Word {
  en: string;
  ar: string;
  pos: string;
}

export interface SentenceExample {
  sentence: string;
  translation: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  theme: Theme;
  speechRate: number;
  voiceURI: string | null;
}

export type View = 'home' | 'dictionary' | 'quiz' | 'chat' | 'about' | 'daily-words';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    isLoading?: boolean;
}

export type QuestionType = 'multiple-choice-translation';

export interface QuizQuestion {
    question: string;
    type: QuestionType;
    options: string[];
    answer: string;
    word: Word;
}