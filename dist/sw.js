/* Public app shell only. Change BUILD whenever a shipped shell asset changes. */
const BUILD = '1.3.0-20261024-1';
const SHELL_FILES = [
  'index.html', 'style.css', 'app.js', 'core.js', 'data.js', 'extra-data.js',
  'vocabulary-foundation.js', 'vocabulary-topics.js',
  'extras.js', 'library-data.js', 'resources-data.js', 'shelf.js', 'companion.js',
  'media.js', 'pwa.js', 'runtime.js', 'icon.svg', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];
const BASE = self.registration.scope;
const PREFIX = `yan-studio-shell:${BASE}:`;
const CACHE = PREFIX + BUILD;
const SHELL_URLS = SHELL_FILES.map(file => new URL(file, BASE).href);
const ALLOWED = new Set(SHELL_URLS);
const INDEX = new URL('index.html', BASE).href;

async function precache() {
  const cache = await caches.open(CACHE);
  // Fetch everything first: an incomplete deployment must never replace a good shell.
  const entries = await Promise.all(SHELL_URLS.map(async url => {
    const response = await fetch(new Request(url, {cache:'reload', credentials:'same-origin'}));
    if (!response.ok || response.type === 'opaque' || response.redirected) {
      throw new Error('Incomplete public app shell');
    }
    return [url, response];
  }));
  await Promise.all(entries.map(([url, response]) => cache.put(url, response)));
}

async function shellReady() {
  const cache = await caches.open(CACHE);
  const entries = await Promise.all(SHELL_URLS.map(url => cache.match(url)));
  return entries.every(Boolean);
}

self.addEventListener('install', event => {
  // No skipWaiting here: an update waits until the user is ready or closes all app windows.
  event.waitUntil(precache().catch(async error => { await caches.delete(CACHE); throw error; }));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  // Fragment routes identify views inside the same document. Some navigation
  // requests preserve that fragment in Request.url, while cache keys do not.
  // Normalize it before the exact public-path check; queries remain excluded.
  url.hash = '';
  // API, private PDFs, query-bearing URLs, outside origins, uploads and arbitrary paths
  // bypass this worker completely. Cache contents are fixed at install time.
  if (url.origin !== new URL(BASE).origin || url.search) return;
  let key = url.href;
  if (request.mode === 'navigate' && (url.href === BASE || url.href === INDEX)) key = INDEX;
  if (!ALLOWED.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(key) || fetch(request);
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'YAN_ACTIVATE_UPDATE') {
    // Sent only after an explicit update action in the app.
    event.waitUntil(self.skipWaiting());
  }
  if (event.data?.type === 'YAN_CACHE_STATUS' && event.ports?.[0]) {
    event.waitUntil(shellReady().then(ready => event.ports[0].postMessage({type:'YAN_CACHE_STATUS', ready, build:BUILD})));
  }
  if (event.data?.type === 'YAN_PREPARE_OFFLINE' && event.ports?.[0]) {
    // Explicit retry recovers cache eviction even if the worker version has not changed.
    event.waitUntil((async () => {
      try { if (!await shellReady()) await precache(); } catch { /* Report actual readiness below. */ }
      event.ports[0].postMessage({type:'YAN_CACHE_STATUS', ready:await shellReady(), build:BUILD});
    })());
  }
});
