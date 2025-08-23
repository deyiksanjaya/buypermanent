const CACHE_NAME = 'qr-generator-cache-v1';
const urlsToCache = [
  '/app/',
  '/app/qrgenerator.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js'
];

// Event install: Dipanggil saat service worker pertama kali diinstal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event fetch: Dipanggil setiap kali ada permintaan jaringan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak, ambil dari jaringan
        return fetch(event.request);
      }
    )
  );
});
