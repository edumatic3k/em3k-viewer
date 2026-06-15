// Service Worker for em3k
const STATIC_CACHE = 'em3k-static-v1';
const LESSONS_CACHE = 'em3k-lessons-v1';
const CONFIG_CACHE = 'em3k-config-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/css/em3k.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-cache failed:', err);
        // Continue anyway - cache errors shouldn't block installation
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      const cache = await caches.open(CONFIG_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (err) {
    // fall through to cache
  }
  const cached = await caches.match(request);
  if (cached) return cached;
  return new Response('Network error', { status: 504, statusText: 'Network error' });
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((resp) => {
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  }).catch(() => null);
  return cached || (await networkPromise) || new Response('Not found', { status: 404 });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // SPA navigation fallback
  const isNavigate = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
  if (isNavigate) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        return response;
      } catch (err) {
        const cachedShell = await caches.match('/index.html');
        return cachedShell || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Config - network first
  if (url.pathname.endsWith('/config.json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Lessons - stale while revalidate
  if (url.pathname.startsWith('/lessons/')) {
    event.respondWith(staleWhileRevalidate(request, LESSONS_CACHE));
    return;
  }

  // Static assets - cache first
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg')
  ) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const fetched = await fetch(request);
        if (fetched && fetched.ok) cache.put(request, fetched.clone());
        return fetched;
      } catch (e) {
        return new Response('Not available', { status: 503 });
      }
    })());
    return;
  }

  // Default: try network then cache
  event.respondWith((async () => {
    try {
      const resp = await fetch(request);
      return resp;
    } catch (e) {
      const cached = await caches.match(request);
      return cached || new Response('Offline', { status: 503 });
    }
  })());
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'CLEAR_CACHES') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
