import React from 'react';
import SettingsIcon from './icons/SettingsIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

interface HeaderProps {
  title: string;
  showHomeButton: boolean;
  onGoHome: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showHomeButton, onGoHome, onOpenSettings }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-6 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-4">
          {showHomeButton && (
            <button
              onClick={onGoHome}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors"
              aria-label="العودة إلى الشاشة الرئيسية"
            >
              <ChevronLeftIcon />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {title}
            </h1>
            {title === 'متعلم كلمات أكسفورد 3000' && (
                <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                    أتقن اللغة الإنجليزية بأدوات مدعومة بالذكاء الاصطناعي.
                </p>
            )}
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors"
          aria-label="فتح الإعدادات"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;