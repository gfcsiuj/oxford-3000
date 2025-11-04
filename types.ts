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