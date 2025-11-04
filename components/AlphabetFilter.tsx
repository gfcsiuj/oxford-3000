import React from 'react';

interface AlphabetFilterProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
}

const AlphabetFilter: React.FC<AlphabetFilterProps> = ({ selectedLetter, onSelectLetter }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-wrap justify-center gap-2 my-6">
      <button
        onClick={() => onSelectLetter(null)}
        aria-pressed={selectedLetter === null}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
          selectedLetter === null
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
        }`}
      >
        All
      </button>
      {alphabet.map(letter => (
        <button
          key={letter}
          onClick={() => onSelectLetter(letter)}
          aria-pressed={selectedLetter === letter}
          className={`w-10 h-10 flex items-center justify-center font-bold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
            selectedLetter === letter
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
