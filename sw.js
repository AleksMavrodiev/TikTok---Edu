// Service worker: makes Curio installable and fully usable offline.
// Bump VERSION whenever a file in ASSETS changes so clients pick up the update.
const VERSION = 'curio-v3';

const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/app.js',
  'js/content.js',
  'js/daily.js',
  'js/feed.js',
  'js/media.js',
  'js/puzzles.js',
  'js/store.js',
  'js/text.js',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'media/clips/history-of-writing.jpg',
  'media/clips/history-of-writing.mp4',
  'media/clips/moon-phases.jpg',
  'media/clips/moon-phases.mp4',
  'media/clips/pendulum.jpg',
  'media/clips/pendulum.mp4',
  'media/clips/pythagoras.jpg',
  'media/clips/pythagoras.mp4',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// <video> asks for byte ranges; answer them from the cached full file.
async function rangeResponse(request) {
  const cached = await caches.match(request.url, { ignoreSearch: true });
  if (!cached) return fetch(request);
  const blob = await cached.blob();
  const m = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  let start = m && m[1] ? Number(m[1]) : 0;
  let end = m && m[2] ? Number(m[2]) : blob.size - 1;
  if (m && !m[1] && m[2]) { start = Math.max(0, blob.size - Number(m[2])); end = blob.size - 1; }
  end = Math.min(end, blob.size - 1);
  if (start > end || start >= blob.size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${blob.size}` } });
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${blob.size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put('index.html', res.clone());
    return res;
  } catch {
    return (await cache.match('index.html')) || Response.error();
  }
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(event.request, { ignoreSearch: true });
  const update = fetch(event.request).then((res) => {
    if (res.status === 200) cache.put(event.request, res.clone());
    return res;
  });
  if (cached) {
    event.waitUntil(update.catch(() => {}));
    return cached;
  }
  return update;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.headers.has('range')) event.respondWith(rangeResponse(request));
  else if (request.mode === 'navigate') event.respondWith(networkFirst(request));
  else event.respondWith(staleWhileRevalidate(event));
});
