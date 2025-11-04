import React from 'react';
import type { Settings, Theme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  availableVoices: SpeechSynthesisVoice[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, availableVoices }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 id="settings-modal-title" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Theme Settings */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Theme</h3>
          <div className="mt-2 flex space-x-2">
            {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => onSettingsChange({ theme })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  settings.theme === theme
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            System setting will match your device's appearance.
          </p>
        </div>

        {/* Speech Speed Settings */}
        <div>
          <label htmlFor="speech-rate" className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Speech Speed
          </label>
          <div className="flex items-center mt-2 space-x-4">
            <input
              id="speech-rate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => onSettingsChange({ speechRate: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-mono text-slate-600 dark:text-slate-400 w-10 text-center">{settings.speechRate.toFixed(1)}x</span>
          </div>
        </div>
        
        {/* Pronunciation Voice Settings */}
        <div>
           <label htmlFor="voice-select" className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Pronunciation Voice
          </label>
          <select 
            id="voice-select"
            value={settings.voiceURI || ''}
            onChange={(e) => onSettingsChange({ voiceURI: e.target.value })}
            className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            disabled={availableVoices.length === 0}
          >
            {availableVoices.length > 0 ? (
              availableVoices.map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {`${voice.name} (${voice.lang})`}
                </option>
              ))
            ) : (
              <option>No English voices found</option>
            )}
          </select>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;