// Service Worker: macht das Spiel installierbar und offline spielbar.
// Code (HTML/JS/CSS) kommt zuerst aus dem Netz, damit Updates sofort ankommen;
// Bilder und Schriften kommen zuerst aus dem Cache.
const CACHE = 'w100-v4';
const CORE = [
  './',
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/data.js',
  'js/schedule.js',
  'js/sprint.js',
  'js/milestones.js',
  'js/events.js',
  'js/content-extra.js',
  'js/game.js',
  'js/ui.js',
  'js/storage.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isImageOrFont = req.destination === 'image' || req.destination === 'font' || url.hostname.endsWith('gstatic.com');

  if (isImageOrFont) {
    // Cache zuerst, sonst laden und merken
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  // Netz zuerst, bei Funkloch aus dem Cache
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && (url.origin === location.origin || url.hostname.endsWith('googleapis.com'))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('index.html')))
  );
});
