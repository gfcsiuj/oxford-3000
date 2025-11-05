import React from 'react';
import StarIcon from './icons/StarIcon';

interface AlphabetFilterProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
  showFavoritesOnly: boolean;
  onShowFavorites: () => void;
}

const AlphabetFilter: React.FC<AlphabetFilterProps> = ({ selectedLetter, onSelectLetter, showFavoritesOnly, onShowFavorites }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-wrap justify-center gap-2 my-6">
      <button
        onClick={() => onSelectLetter(null)}
        aria-pressed={!showFavoritesOnly && selectedLetter === null}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
          !showFavoritesOnly && selectedLetter === null
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
        }`}
      >
        All
      </button>
       <button
        onClick={onShowFavorites}
        aria-pressed={showFavoritesOnly}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center gap-1.5 ${
          showFavoritesOnly
            ? 'bg-yellow-500 text-white shadow-lg'
            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
        }`}
      >
        <StarIcon filled={showFavoritesOnly} className="h-5 w-5" />
        Favorites
      </button>
      {alphabet.map(letter => (
        <button
          key={letter}
          onClick={() => onSelectLetter(letter)}
          aria-pressed={!showFavoritesOnly && selectedLetter === letter}
          className={`w-10 h-10 flex items-center justify-center font-bold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
            !showFavoritesOnly && selectedLetter === letter
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default AlphabetFilter;