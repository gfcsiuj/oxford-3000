import React from 'react';
import { oxford3000 } from '../data/words';
import type { Word, Settings, SentenceExample } from '../types';
import WordCard from './WordCard';
import { generateSentences } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import SpeakerIcon from './icons/SpeakerIcon';

interface DailyWordsScreenProps {
  settings: Settings;
  voice: SpeechSynthesisVoice | null;
}

const SentencesViewer: React.FC<{
  word: Word;
  speechRate: number;
  voice: SpeechSynthesisVoice | null;
}> = ({ word, speechRate, voice }) => {
  const [sentences, setSentences] = React.useState<SentenceExample[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSentences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateSentences(word.en);
        setSentences(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSentences();
  }, [word]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice?.lang || 'en-US';
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 p-4">
        <LoadingSpinner />
        <p className="text-slate-500 dark:text-slate-400">جاري إنشاء الأمثلة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">
        <p><strong>خطأ:</strong> {error}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4 p-4">
      {sentences.map((item, index) => (
        <li key={index} className="p-3 border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleSpeak(item.sentence)}
              className="flex-shrink-0 mt-1 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label={`استمع إلى: ${item.sentence}`}
            >
              <SpeakerIcon />
            </button>
            <div className="text-right w-full">
              <p className="text-slate-800 dark:text-slate-200 text-left" dir="ltr">{item.sentence}</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1 font-arabic" dir="rtl">{item.translation}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};


const DailyWordsScreen: React.FC<DailyWordsScreenProps> = ({ settings, voice }) => {
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try {
      const storedFavorites = localStorage.getItem('favoriteWords');
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch { return []; }
  });

  const [expandedWord, setExpandedWord] = React.useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem('favoriteWords', JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = (wordEn: string) => {
    setFavorites(prev => 
      prev.includes(wordEn) 
        ? prev.filter(w => w !== wordEn) 
        : [...prev, wordEn]
    );
  };
    
  const dailyWords = React.useMemo(() => {
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const pseudoRandom = (seed: number) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const shuffled = [...oxford3000].sort((a, b) => {
      const aSeed = dayOfYear + a.en.charCodeAt(0) + (a.en.charCodeAt(1) || 0);
      const bSeed = dayOfYear + b.en.charCodeAt(0) + (b.en.charCodeAt(1) || 0);
      return pseudoRandom(aSeed) - pseudoRandom(bSeed);
    });
    
    return shuffled.slice(0, 5);
  }, []);

  const handleToggleExamples = (word: Word) => {
    setExpandedWord(prev => prev === word.en ? null : word.en);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <p className="text-center text-slate-600 dark:text-slate-400">
        اكتشف وتعلم خمس كلمات جديدة كل يوم لتعزيز مفرداتك!
      </p>
      {dailyWords.map(word => (
        <div key={word.en} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
          <WordCard 
            word={word} 
            onViewExamples={handleToggleExamples}
            speechRate={settings.speechRate}
            voice={voice}
            isFavorite={favorites.includes(word.en)}
            onToggleFavorite={handleToggleFavorite}
          />
          {expandedWord === word.en && (
             <div className="border-t border-slate-200 dark:border-slate-700">
                <SentencesViewer word={word} speechRate={settings.speechRate} voice={voice} />
             </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DailyWordsScreen;