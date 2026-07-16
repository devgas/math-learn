const CACHE_NAME = "math-quest-v3";
const STATIC_ASSETS = ["/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Never serve stale hashed build assets from cache. If a chunk is missing
  // from the current build it must 404 on the network rather than fall back
  // to a previous deployment's chunk, which would crash the app.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        if (STATIC_ASSETS.some((asset) => url.pathname.endsWith(asset))) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
