import React from 'react';
import { oxford3000 } from '../data/words';
import type { Word, Settings } from '../types';
import SearchBar from './SearchBar';
import AlphabetFilter from './AlphabetFilter';
import WordCard from './WordCard';
import SentencesModal from './SentencesModal';

interface DictionaryScreenProps {
  settings: Settings;
  voice: SpeechSynthesisVoice | null;
}

const DictionaryScreen: React.FC<DictionaryScreenProps> = ({ settings, voice }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLetter, setSelectedLetter] = React.useState<string | null>(null);
  const [selectedWord, setSelectedWord] = React.useState<Word | null>(null);
  const [isSentencesModalOpen, setIsSentencesModalOpen] = React.useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);

  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try {
      const storedFavorites = localStorage.getItem('favoriteWords');
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('favoriteWords', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleSelectLetter = (letter: string | null) => {
    setSelectedLetter(letter);
    setShowFavoritesOnly(false);
  };

  const handleShowFavorites = () => {
    setSelectedLetter(null);
    setShowFavoritesOnly(true);
  };

  const handleToggleFavorite = (wordEn: string) => {
    setFavorites(prev => 
      prev.includes(wordEn) 
        ? prev.filter(w => w !== wordEn) 
        : [...prev, wordEn]
    );
  };

  const handleViewExamples = (word: Word) => {
    setSelectedWord(word);
    setIsSentencesModalOpen(true);
  };

  const filteredWords = React.useMemo(() => {
    const sourceWords = showFavoritesOnly
      ? oxford3000.filter(word => favorites.includes(word.en))
      : oxford3000;

    return sourceWords.filter(word => {
      const matchesLetter = selectedLetter ? word.en.toUpperCase().startsWith(selectedLetter) : true;
      const matchesSearch = word.en.toLowerCase().includes(searchTerm) || word.ar.includes(searchTerm);
      return matchesLetter && matchesSearch;
    });
  }, [searchTerm, selectedLetter, favorites, showFavoritesOnly]);

  return (
    <>
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
        <div className="mt-6">
            <AlphabetFilter 
              selectedLetter={selectedLetter} 
              onSelectLetter={handleSelectLetter}
              showFavoritesOnly={showFavoritesOnly}
              onShowFavorites={handleShowFavorites}
            />
        </div>
      </div>
     
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredWords.map(word => (
          <WordCard 
            key={word.en} 
            word={word} 
            onViewExamples={handleViewExamples}
            speechRate={settings.speechRate}
            voice={voice}
            isFavorite={favorites.includes(word.en)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
      
      {filteredWords.length === 0 && (
         <div className="text-center py-16">
          {showFavoritesOnly ? (
            <>
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">لا توجد كلمات مفضلة بعد</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">انقر على أيقونة النجمة على كلمة لإضافتها هنا.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">لم يتم العثور على كلمات</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">حاول تعديل بحثك أو الفلتر.</p>
            </>
          )}
        </div>
      )}

      <SentencesModal 
        isOpen={isSentencesModalOpen}
        onClose={() => setIsSentencesModalOpen(false)}
        word={selectedWord}
        speechRate={settings.speechRate}
        voice={voice}
      />
    </>
  );
}

export default DictionaryScreen;