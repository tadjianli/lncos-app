/**
 * LN COS — Service Worker
 * Offline-first shell: static assets from cache, pages network-first with
 * cache fallback. Keeps the app shell available instantly on repeat visits.
 */

const CACHE_VERSION = "lncos-v1";
const SHELL_CACHE   = `${CACHE_VERSION}-shell`;
const IMG_CACHE     = `${CACHE_VERSION}-images`;
const FONT_CACHE    = `${CACHE_VERSION}-fonts`;

/* ── Static shell files pre-cached on install ──────────────────── */
const SHELL_URLS = [
  "/",
  "/discover",
  "/bag",
  "/favorites",
  "/profile",
  "/rdv",
  "/offline",
];

/* ── Install: pre-cache shell ──────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_URLS).catch(() => {
        // Silently ignore individual cache failures — don't abort install
      })
    )
  );
  self.skipWaiting();
});

/* ── Activate: purge stale caches ──────────────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("lncos-") && !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: routing strategy ───────────────────────────────────── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Don't intercept Next.js internals, API routes, or admin
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin")
  ) {
    return;
  }

  // Images → cache-first with network fallback
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  // Fonts → cache-first (immutable)
  if (
    request.destination === "font" ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "fonts.googleapis.com"
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Navigation (HTML pages) → network-first, fallback to cache, then offline page
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Everything else → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});

/* ── Strategies ────────────────────────────────────────────────── */

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Serve cached home as fallback for unknown pages
    const fallback = await caches.match("/");
    return fallback ?? new Response("Hors ligne", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached ?? (await fetchPromise) ?? new Response("", { status: 503 });
}
