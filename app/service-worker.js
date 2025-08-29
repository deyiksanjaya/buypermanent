// Nama cache yang baru, ubah versinya (v2, v3, dst.) setiap kali Anda mengubah file lokal
const STATIC_CACHE_NAME = 'qr-generator-static-v2';
const DYNAMIC_CACHE_NAME = 'qr-generator-dynamic-v2';

// Aset inti (App Shell) yang WAJIB ada untuk aplikasi berjalan
const urlsToCache = [
  '/app/',
  '/app/qrgenerator.html'
  // Jika Anda punya file CSS atau JS lokal, tambahkan di sini.
  // '/app/style.css',
  // '/app/main.js'
];

// Event install: Menyimpan App Shell ke static cache
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching App Shell...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event activate: Membersihkan cache lama yang tidak terpakai
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          console.log('[Service Worker] Removing old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Event fetch: Mengelola semua permintaan jaringan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 1. Jika ada di cache, kembalikan dari cache (Cache First untuk App Shell)
        if (response) {
          return response;
        }

        // 2. Jika tidak ada di cache, ambil dari jaringan
        return fetch(event.request)
          .then(networkResponse => {
            // Simpan salinan respons jaringan ke dynamic cache untuk penggunaan offline nanti
            return caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                // Jangan cache permintaan non-GET atau dari ekstensi chrome
                if (event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension://')) {
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              });
          })
          .catch(err => {
            // Opsional: Sediakan halaman fallback jika offline dan tidak ada di cache
            // return caches.match('/app/offline.html');
          });
      })
  );
});
