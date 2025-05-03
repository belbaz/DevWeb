// public/sw.js

const CACHE_NAME = 'musehome-static-v1';
const RUNTIME_CACHE = 'musehome-runtime-v1';

// Liste des assets à pré-cacher
const PRECACHE_URLS = [
  '/',                          // route principale
  '/manifest.json',             // manifest PWA
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/favicon.ico',
  '/offline.html',
  '/styles/globals.css',
  '/styles/style.css',
  '/styles/header.css',
  '/styles/footer.css',
  '/styles/home.css',
];

// Installation : on pré-cache les assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation : on supprime les anciens caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch : stratégies de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Pour les requêtes API, on fait un network-first
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mémoriser la réponse dans le cache runtime
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() =>
          caches.match(request)
        )
    );
    return;
  }

// Pour les navigations (HTML), network-first fallback cache, puis offline.html
  if (request.mode === 'navigate') {
  event.respondWith(
      fetch(request)
      .then((response) => {
          // on garde en cache
          return caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, response.clone());
          return response;
          });
      })
      .catch(() =>
          caches.match(request).then((cached) =>
          cached || caches.match('/offline.html')
          )
      )
  );
  return;
  }


  // Pour les feuilles de style, scripts et images : cache-first
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Sinon : fetch normal
  event.respondWith(fetch(request));
});
