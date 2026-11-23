// Motivnavi OS - About : Service Worker
// 内容を更新したら CACHE_VERSION を上げると、古いキャッシュが削除されます
const CACHE_VERSION = 'v19';
const CACHE_NAME = `motivnavi-about-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/download/',
  '/css/style.css',
  '/js/app.js',
  '/manifest.webmanifest',
  '/images/wallpaper/wallpaper.webp',
  '/images/wallpaper/wallpaper.jpg',
  '/images/wallpaper/android-auto.webp',
  '/images/wallpaper/android-auto.jpg',
  '/images/wallpaper/mediablue.webp',
  '/images/wallpaper/mediablue.jpg',
  '/icons/favicon.ico',
  '/icons/favicon-32.png',
  '/icons/favicon-64.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/enoki-192.png',
  // 写真は一覧用（800px）のみ事前キャッシュ。拡大用は表示時にキャッシュされます
  '/images/photos/android-auto-800.webp',
  '/images/photos/android-auto-800.jpg',
  '/images/photos/mediablue-800.webp',
  '/images/photos/mediablue-800.jpg',
  '/images/screenshots/aa-map-music-800.webp',
  '/images/screenshots/aa-map-music-800.jpg',
  '/images/screenshots/desktop-launcher-keyboard-800.webp',
  '/images/screenshots/desktop-launcher-keyboard-800.jpg',
  '/images/screenshots/desktop-home-800.webp',
  '/images/screenshots/desktop-home-800.jpg',
  '/images/projects/caramel-os-800.webp',
  '/images/projects/caramel-os-800.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('motivnavi-about-') && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // ページ本体: ネットワーク優先（オフライン時はキャッシュ）
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // ページごとに保存（/download/ などがトップを上書きしないように）
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // 静的ファイル: キャッシュ優先、裏で更新
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
