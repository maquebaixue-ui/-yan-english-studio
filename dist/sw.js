/* Public app shell only. Change BUILD whenever a shipped shell asset changes. */
const BUILD = '1.12.0-20261025-1';
const SHELL_FILES = [
  'companion-options.js',
  'recall.js', 'recall-core.js', 'recall-state.js', 'recall-data.js',
  'methods.js', 'methods-core.js', 'methods-state.js', 'methods-data.js', 'methods-timing.js',
  'voice-config.js', 'voice-client.js', 'voice-worker.js', 'audio/voices/source.json', 'audio/voices/model-license.txt', 'audio/voices/code-license.txt',
  'audio/voices/M2-w001.mp3', 'audio/voices/M2-w002.mp3', 'audio/voices/M2-w003.mp3', 'audio/voices/M2-w004.mp3', 'audio/voices/M2-w005.mp3', 'audio/voices/M2-w006.mp3', 'audio/voices/M2-w007.mp3', 'audio/voices/M2-w008.mp3', 'audio/voices/M2-w009.mp3', 'audio/voices/M2-w010.mp3', 'audio/voices/M2-w011.mp3', 'audio/voices/M2-w012.mp3', 'audio/voices/M2-w013.mp3', 'audio/voices/M2-w014.mp3', 'audio/voices/M2-w015.mp3', 'audio/voices/M2-w016.mp3', 'audio/voices/M2-w017.mp3', 'audio/voices/M2-w018.mp3', 'audio/voices/M2-w019.mp3', 'audio/voices/M2-w020.mp3', 'audio/voices/M2-l01.mp3', 'audio/voices/M2-l02.mp3', 'audio/voices/M2-l03.mp3', 'audio/voices/M2-l04.mp3', 'audio/voices/M2-preview.mp3', 'audio/voices/M4-w001.mp3', 'audio/voices/M4-w002.mp3', 'audio/voices/M4-w003.mp3', 'audio/voices/M4-w004.mp3', 'audio/voices/M4-w005.mp3', 'audio/voices/M4-w006.mp3', 'audio/voices/M4-w007.mp3', 'audio/voices/M4-w008.mp3', 'audio/voices/M4-w009.mp3', 'audio/voices/M4-w010.mp3', 'audio/voices/M4-w011.mp3', 'audio/voices/M4-w012.mp3', 'audio/voices/M4-w013.mp3', 'audio/voices/M4-w014.mp3', 'audio/voices/M4-w015.mp3', 'audio/voices/M4-w016.mp3', 'audio/voices/M4-w017.mp3', 'audio/voices/M4-w018.mp3', 'audio/voices/M4-w019.mp3', 'audio/voices/M4-w020.mp3', 'audio/voices/M4-l01.mp3', 'audio/voices/M4-l02.mp3', 'audio/voices/M4-l03.mp3', 'audio/voices/M4-l04.mp3', 'audio/voices/M4-preview.mp3', 'audio/voices/M5-w001.mp3', 'audio/voices/M5-w002.mp3', 'audio/voices/M5-w003.mp3', 'audio/voices/M5-w004.mp3', 'audio/voices/M5-w005.mp3', 'audio/voices/M5-w006.mp3', 'audio/voices/M5-w007.mp3', 'audio/voices/M5-w008.mp3', 'audio/voices/M5-w009.mp3', 'audio/voices/M5-w010.mp3', 'audio/voices/M5-w011.mp3', 'audio/voices/M5-w012.mp3', 'audio/voices/M5-w013.mp3', 'audio/voices/M5-w014.mp3', 'audio/voices/M5-w015.mp3', 'audio/voices/M5-w016.mp3', 'audio/voices/M5-w017.mp3', 'audio/voices/M5-w018.mp3', 'audio/voices/M5-w019.mp3', 'audio/voices/M5-w020.mp3', 'audio/voices/M5-l01.mp3', 'audio/voices/M5-l02.mp3', 'audio/voices/M5-l03.mp3', 'audio/voices/M5-l04.mp3', 'audio/voices/M5-preview.mp3',
  'learning.js', 'learning-core.js', 'learning-state.js', 'learning-data.js', 'speech.js', 'audio/l01.wav', 'audio/l02.wav', 'audio/l03.wav', 'audio/l04.wav',
  'index.html', 'style.css', 'app.js', 'core.js', 'data.js', 'extra-data.js',
  'vocabulary-foundation.js', 'vocabulary-topics.js',
  'vocabulary-dictionary.js', 'vocabulary-source.json', 'vocabulary-shelf.js',
  'extras.js', 'browser-ai.js', 'ai-prompts.js', 'connections.js', 'connection-info.js', 'library-data.js', 'resources-data.js', 'shelf.js', 'companion.js',
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
  if (request.method !== 'GET') return;
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
  if(request.headers.has('range')&&!/\.(wav|mp3)$/.test(url.pathname))return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const response=await cache.match(key);
    if(!response)return fetch(request);
    if(!request.headers.has('range'))return response;
    // Native mobile audio players request byte ranges, including when offline.
    const bytes=await response.arrayBuffer(),length=bytes.byteLength;
    const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range')||'');
    let start=match?.[1]?Number(match[1]):match?.[2]?Math.max(0,length-Number(match[2])):NaN;
    let end=match?.[1]&&match?.[2]?Math.min(length-1,Number(match[2])):length-1;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=length||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${length}`}});
    return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':url.pathname.endsWith('.mp3')?'audio/mpeg':'audio/wav','Content-Range':`bytes ${start}-${end}/${length}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
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
