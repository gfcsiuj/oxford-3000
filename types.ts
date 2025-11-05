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

export type QuestionType =
  | 'MC_EN_AR'
  | 'MC_AR_EN'
  | 'LISTEN_CHOOSE_EN'
  | 'LISTEN_TYPE_EN'
  | 'SPELLING_BEE'
  | 'POS_ID'
  | 'FILL_BLANK'
  | 'MATCH_PAIRS';

export interface QuizQuestion {
    type: QuestionType;
    word: Word;
    questionText: string;
    options?: string[];
    answer: string;
    matchPairs?: { en: string; ar: string }[];
}

export interface QuizSettings {
    questionCount: number;
    letters: string[];
    questionTypes: QuestionType[];
}

export interface UserAnswer {
    question: QuizQuestion;
    answer: string | { en: string; ar: string }[];
    isCorrect: boolean;
}
