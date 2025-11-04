const CACHE_NAME = 'oxford-3000-learner-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/components/Header.tsx',
  '/components/SearchBar.tsx',
  '/components/AlphabetFilter.tsx',
  '/components/WordCard.tsx',
  '/components/SentencesModal.tsx',
  '/components/SettingsModal.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/icons/SettingsIcon.tsx',
  '/components/icons/SpeakerIcon.tsx',
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
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // We only handle GET requests for caching.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Not in cache - fetch from network
      return fetch(event.request);
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
