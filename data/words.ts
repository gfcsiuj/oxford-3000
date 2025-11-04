import type { Word } from '../types';
import { englishWords } from './english_words';
import { arabicWords } from './arabic_words';
import { partsOfSpeech } from './partsOfSpeech';

export const oxford3000: Word[] = englishWords.map((en, index) => ({
  en,
  ar: arabicWords[index],
  pos: partsOfSpeech[index],
}));