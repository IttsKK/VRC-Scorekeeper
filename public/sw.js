// VEX Score Tracker Service Worker
const CACHE_NAME = "vex-score-tracker-v1";

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/ring.png",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - precache key assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients so the SW is in control immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If offline, try to serve from cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // If not in cache, serve the root page from cache
          return caches.match("/");
        });
      })
    );
    return;
  }

  // For all other requests, use a stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Use cached response immediately if available
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Update the cache with the new response
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log("Fetch failed; returning cached response or null");
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
