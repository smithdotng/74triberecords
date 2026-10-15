/* 74 Tribe Studios service worker
 * - App shell + static assets: cache first (they're content-hashed by Next)
 * - Pages: network first, falling back to the last cached copy, then /offline
 * - YouTube thumbnails: stale-while-revalidate so libraries feel instant
 * - API, auth and YouTube player requests are never cached
 */
const VERSION = "t74-v2";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const IMAGES = `${VERSION}-images`;
const PRECACHE = ["/offline", "/brand/logo-mark.png", "/brand/logo-wordmark.png", "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Thumbnails from YouTube's image CDN
  if (url.hostname === "i.ytimg.com" || url.hostname === "img.youtube.com") {
    event.respondWith(
      caches.open(IMAGES).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok || res.type === "opaque") {
              cache.put(req, res.clone());
              trim(IMAGES, 300);
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data")) return;

  // Immutable build assets and our own images
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/brand/") || url.pathname.startsWith("/demo/")) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(STATIC).then((c) => c.put(req, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  // Page navigations
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && !/^\/(admin|library|account)/.test(url.pathname)) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy)).then(() => trim(PAGES, 40));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/offline")))
    );
  }
});
