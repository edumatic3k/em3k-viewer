export const CONFIG_CACHE_NAME = 'em3k-config-v1';
export const STATIC_CACHE = 'em3k-static-v1';
export const LESSONS_CACHE = 'em3k-lessons-v1';

export async function cachePut(url, response, cacheName = CONFIG_CACHE_NAME) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(url, response.clone());
  } catch (e) {
    // ignore cache errors
  }
}

export async function cacheMatchJson(url) {
  if (!('caches' in window)) return null;
  try {
    const res = await caches.match(url);
    if (!res) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}
