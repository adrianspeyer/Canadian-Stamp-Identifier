/**
 * Canadian Stamp Identifier — Service Worker
 * Caches stamps.json and recently viewed stamp images for fast repeat visits.
 * Especially important on iOS where Safari aggressively evicts HTTP cache.
 */

const CACHE_NAME = 'csi-v4';
const DATA_CACHE = 'csi-data-v4';
const IMAGE_CACHE = 'csi-images-v4';
const MAX_CACHED_IMAGES = 500; // Cap image cache to ~50MB (avg ~100KB each)

// Core app files — cached on install
const CORE_FILES = [
    './',
    './index.html',
    './css/style.css',
    './js/i18n.js',
    './js/app.js',
    './data/stamps.json',
    './data/stamps-fr.json'
];

// Install: cache core files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES))
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME && key !== DATA_CACHE && key !== IMAGE_CACHE)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: different strategies for different content
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) return;

    const path = url.pathname;

    // stamps.json — network first, fall back to cache
    if (path.endsWith('/stamps.json')) {
        event.respondWith(networkFirstThenCache(event.request, DATA_CACHE));
        return;
    }

    // Stamp images — cache first, fall back to network (then cache the response)
    if (path.includes('/images/') && /\.(jpe?g|png|webp|gif)$/i.test(path)) {
        event.respondWith(cacheFirstThenNetwork(event.request, IMAGE_CACHE));
        return;
    }

    // Core app files (HTML, CSS, JS) — cache first, fall back to network
    if (path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js') || path.endsWith('/')) {
        event.respondWith(cacheFirstThenNetwork(event.request, CACHE_NAME));
        return;
    }
});

/**
 * Network first, cache fallback.
 * Used for stamps.json — always try to get fresh data, but serve cached if offline.
 */
async function networkFirstThenCache(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        const cached = await caches.match(request);
        return cached || new Response('{"stamps":[]}', {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Cache first, network fallback.
 * Used for images — serve from cache instantly, fetch and cache if not cached yet.
 * Trims cache when it exceeds MAX_CACHED_IMAGES.
 */
async function cacheFirstThenNetwork(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());

            // Trim image cache if it's getting too large
            if (cacheName === IMAGE_CACHE) {
                trimCache(cacheName, MAX_CACHED_IMAGES);
            }
        }
        return response;
    } catch (e) {
        // Return empty response rather than error — placeholder stays visible
        return new Response('', { status: 404 });
    }
}

/**
 * Trim cache to max entries, removing oldest first.
 */
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        // Delete oldest entries (first in the list)
        const toDelete = keys.length - maxItems;
        for (let i = 0; i < toDelete; i++) {
            await cache.delete(keys[i]);
        }
    }
}
