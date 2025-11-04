import React from 'react';
import SettingsIcon from './icons/SettingsIcon';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 py-6 md:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
            Oxford 3000 Word Learner
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Master the most important English words with AI-powered examples.
          </p>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors"
          aria-label="Open settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
