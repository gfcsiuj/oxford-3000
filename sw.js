const CACHE_NAME = 'oxford-3000-learner-v2';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  // New Screens
  '/components/HomeScreen.tsx',
  '/components/DictionaryScreen.tsx',
  '/components/QuizScreen.tsx',
  '/components/ChatScreen.tsx',
  '/components/AboutScreen.tsx',
  '/components/DailyWordsScreen.tsx',
  // Re-used components
  '/components/Header.tsx',
  '/components/SearchBar.tsx',
  '/components/AlphabetFilter.tsx',
  '/components/WordCard.tsx',
  '/components/SentencesModal.tsx',
  '/components/SettingsModal.tsx',
  '/components/LoadingSpinner.tsx',
  // Icons
  '/components/icons/SettingsIcon.tsx',
  '/components/icons/SpeakerIcon.tsx',
  '/components/icons/StarIcon.tsx',
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/ChatBubbleIcon.tsx',
  '/components/icons/ChevronLeftIcon.tsx',
  '/components/icons/ClipboardCheckIcon.tsx',
  '/components/icons/InformationCircleIcon.tsx',
  '/components/icons/InstagramIcon.tsx',
  '/components/icons/FacebookIcon.tsx',
  '/components/icons/TelegramIcon.tsx',
  '/components/icons/SparklesIcon.tsx',
  // Data
  '/data/words.ts',
  '/data/english_words.ts',
  '/data/arabic_words.ts',
  '/data/partsOfSpeech.ts',
  '/data/a_words_sentences.ts',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(APP_SHELL_URLS).catch(err => {
        console.error('Failed to cache all files:', err);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});