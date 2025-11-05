import React from 'react';
import { oxford3000 } from './data/words';
import type { Word, Settings, Theme } from './types';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import AlphabetFilter from './components/AlphabetFilter';
import WordCard from './components/WordCard';
import SentencesModal from './components/SentencesModal';
import SettingsModal from './components/SettingsModal';

function App() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLetter, setSelectedLetter] = React.useState<string | null>(null);
  const [selectedWord, setSelectedWord] = React.useState<Word | null>(null);
  const [isSentencesModalOpen, setIsSentencesModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);

  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try {
      const storedFavorites = localStorage.getItem('favoriteWords');
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = React.useState<Settings>(() => {
    const storedSettings = localStorage.getItem('settings');
    const defaults: Settings = {
      theme: 'system',
      speechRate: 1,
      voiceURI: null,
    };
    try {
      return storedSettings ? { ...defaults, ...JSON.parse(storedSettings) } : defaults;
    } catch {
      return defaults;
    }
  });

  React.useEffect(() => {
    // Persist settings to localStorage
    localStorage.setItem('settings', JSON.stringify(settings));

    // Handle theme change
    const root = window.document.documentElement;
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (settings.theme === 'dark' || (settings.theme === 'system' && systemIsDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);
  
  React.useEffect(() => {
    const populateVoiceList = () => {
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
        setAvailableVoices(englishVoices);

        if (!settings.voiceURI && englishVoices.length > 0) {
           const defaultVoice = englishVoices.find(v => v.default) || englishVoices[0];
           if (defaultVoice) {
               handleSettingsChange({ voiceURI: defaultVoice.voiceURI });
           }
        }
    };

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, [settings.voiceURI]);

  React.useEffect(() => {
    // Persist favorites to localStorage
    localStorage.setItem('favoriteWords', JSON.stringify(favorites));
  }, [favorites]);


  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleSelectLetter = (letter: string | null) => {
    setSelectedLetter(letter);
    setShowFavoritesOnly(false); // Exit favorites mode when a letter is selected
  };

  const handleShowFavorites = () => {
    setSelectedLetter(null); // Deselect any letter when showing favorites
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
      const matchesSearch = word.en.toLowerCase().includes(searchTerm);
      return matchesLetter && matchesSearch;
    });
  }, [searchTerm, selectedLetter, favorites, showFavoritesOnly]);
  
  const selectedVoice = React.useMemo(() => {
    return availableVoices.find(v => v.voiceURI === settings.voiceURI) || null;
  }, [settings.voiceURI, availableVoices]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <Header onOpenSettings={() => setIsSettingsModalOpen(true)} />

      <main className="container mx-auto px-4 py-8 md:px-8">
        <div className="sticky top-0 z-10 py-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
           <SearchBar onSearch={handleSearch} />
        </div>
       
        <AlphabetFilter 
            selectedLetter={selectedLetter} 
            onSelectLetter={handleSelectLetter}
            showFavoritesOnly={showFavoritesOnly}
            onShowFavorites={handleShowFavorites}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWords.map(word => (
            <WordCard 
              key={word.en} 
              word={word} 
              onViewExamples={handleViewExamples}
              speechRate={settings.speechRate}
              voice={selectedVoice}
              isFavorite={favorites.includes(word.en)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
        
        {filteredWords.length === 0 && (
           <div className="text-center py-16">
            {showFavoritesOnly ? (
              <>
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">No favorite words yet</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Click the star icon on a word to add it here.</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">No words found</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Try adjusting your search or filter.</p>
              </>
            )}
          </div>
        )}
      </main>

      <SentencesModal 
        isOpen={isSentencesModalOpen}
        onClose={() => setIsSentencesModalOpen(false)}
        word={selectedWord}
        speechRate={settings.speechRate}
        voice={selectedVoice}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        availableVoices={availableVoices}
      />
    </div>
  );
}

export default App;