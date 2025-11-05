import React from 'react';
import type { Settings, View } from './types';
import HomeScreen from './components/HomeScreen';
import DictionaryScreen from './components/DictionaryScreen';
import QuizScreen from './components/QuizScreen';
import ChatScreen from './components/ChatScreen';
import AboutScreen from './components/AboutScreen';
import SettingsModal from './components/SettingsModal';
import Header from './components/Header';
import DailyWordsScreen from './components/DailyWordsScreen';

function App() {
  const [view, setView] = React.useState<View>('home');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);

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
    localStorage.setItem('settings', JSON.stringify(settings));
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

  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  };
  
  const selectedVoice = React.useMemo(() => {
    return availableVoices.find(v => v.voiceURI === settings.voiceURI) || null;
  }, [settings.voiceURI, availableVoices]);

  const renderView = () => {
    switch (view) {
      case 'dictionary':
        return <DictionaryScreen settings={settings} voice={selectedVoice} />;
      case 'quiz':
        return <QuizScreen settings={settings} voice={selectedVoice} />;
      case 'chat':
        return <ChatScreen />;
      case 'about':
        return <AboutScreen />;
      case 'daily-words':
        return <DailyWordsScreen settings={settings} voice={selectedVoice} />;
      case 'home':
      default:
        return <HomeScreen setView={setView} />;
    }
  };
  
  const getTitle = () => {
      switch (view) {
          case 'dictionary': return 'القاموس';
          case 'quiz': return 'مركز الاختبارات';
          case 'chat': return 'الدردشة مع مدرس اللغة الإنجليزية';
          case 'about': return 'عن التطبيق';
          case 'daily-words': return 'كلمات اليوم';
          case 'home':
          default:
            return 'متعلم كلمات أكسفورد 3000'
      }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <Header 
        title={getTitle()}
        showHomeButton={view !== 'home'}
        onGoHome={() => setView('home')}
        onOpenSettings={() => setIsSettingsModalOpen(true)} 
      />
      <main className="px-4 py-8 md:px-8">
        <div className="container mx-auto">
          <div className={view !== 'home' ? 'animate-fade-in' : ''}>
            {renderView()}
          </div>
        </div>
      </main>
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