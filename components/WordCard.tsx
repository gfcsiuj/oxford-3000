import React from 'react';
import type { Word } from '../types';
import SpeakerIcon from './icons/SpeakerIcon';
import StarIcon from './icons/StarIcon';

interface WordCardProps {
  word: Word;
  onViewExamples: (word: Word) => void;
  speechRate: number;
  voice: SpeechSynthesisVoice | null;
  isFavorite: boolean;
  onToggleFavorite: (wordEn: string) => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, onViewExamples, speechRate, voice, isFavorite, onToggleFavorite }) => {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(word.en);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        // Fallback to a standard English voice if no specific voice is selected
        utterance.lang = 'en-US';
      }
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div className="pr-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{word.en}</h3>
            <p className="text-sm italic text-slate-500 dark:text-slate-400 capitalize">{word.pos}</p>
          </div>
          <div className="flex items-center flex-shrink-0">
             <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(word.en);
              }}
              className={`p-2 rounded-full transition-colors ${
                isFavorite 
                  ? 'text-yellow-400 hover:text-yellow-500' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-yellow-500`}
              aria-label={isFavorite ? `Remove ${word.en} from favorites` : `Add ${word.en} to favorites`}
              aria-pressed={isFavorite}
            >
              <StarIcon filled={isFavorite} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak();
              }}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors"
              aria-label={`Listen to the pronunciation of ${word.en}`}
            >
              <SpeakerIcon />
            </button>
          </div>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 font-arabic" dir="rtl">{word.ar}</p>
      </div>
      <div className="mt-6">
        <button
          onClick={() => onViewExamples(word)}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          View Examples
        </button>
      </div>
    </div>
  );
};

export default WordCard;
