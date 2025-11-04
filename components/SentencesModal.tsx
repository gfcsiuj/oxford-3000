import React from 'react';
import { generateSentences } from '../services/geminiService';
import type { SentenceExample, Word } from '../types';
import LoadingSpinner from './LoadingSpinner';
import SpeakerIcon from './icons/SpeakerIcon';
import { aWordsSentences } from '../data/a_words_sentences';

interface SentencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: Word | null;
  speechRate: number;
  voice: SpeechSynthesisVoice | null;
}

const SentencesModal: React.FC<SentencesModalProps> = ({ isOpen, onClose, word, speechRate, voice }) => {
  const [sentences, setSentences] = React.useState<SentenceExample[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && word) {
      // Reset state for the new word
      setIsLoading(true);
      setError(null);
      setSentences([]);

      const wordKey = word.en.toLowerCase();
      
      // Check for pre-defined sentences first
      if (aWordsSentences[wordKey]) {
        setTimeout(() => { // Simulate a micro-task to allow UI to update
          setSentences(aWordsSentences[wordKey]);
          setIsLoading(false);
        }, 0);
        return; // Use pre-defined sentences and skip API call
      }

      // Fallback to API call if no pre-defined sentences are found
      const fetchSentences = async () => {
        try {
          const result = await generateSentences(word.en);
          setSentences(result);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchSentences();
    }
  }, [isOpen, word]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };


  if (!isOpen || !word) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sentences-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="sentences-modal-title" className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Examples for <span className="text-blue-600 dark:text-blue-400">{word.en}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
            <p className="font-semibold">Oops! Something went wrong.</p>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && sentences.length > 0 && (
          <ul className="space-y-6">
            {sentences.map((item, index) => (
              <li key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleSpeak(item.sentence)}
                    className="flex-shrink-0 mt-1 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label={`Listen to: ${item.sentence}`}
                  >
                    <SpeakerIcon />
                  </button>
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 text-base md:text-lg">{item.sentence}</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 font-arabic text-base md:text-lg" dir="rtl">{item.translation}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SentencesModal;
