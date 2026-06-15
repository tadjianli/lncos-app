/**
 * LN COS — Service Worker
 * Network-first navigation with cache fallback. Only stores successful responses.
 * CACHE_VERSION est injecté à chaque build (scripts/generate-sw.mjs + déploiement Vercel).
 */

const CACHE_VERSION = "lncos-development";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const IMG_CACHE = `${CACHE_VERSION}-images`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;

const ACTIVE_CACHE_NAMES = new Set([SHELL_CACHE, IMG_CACHE, FONT_CACHE]);

/** Pages shell + info légales (contenu statique — precache pour fallback fiable). */
const SHELL_URLS = [
  "/",
  "/boutique",
  "/discover",
  "/bag",
  "/favorites",
  "/profile",
  "/rdv",
  "/offline",
  "/faq",
  "/contact",
  "/livraison",
  "/retours",
  "/cgv",
  "/confidentialite",
  "/mentions-legales",
];

const SW_DEBUG = CACHE_VERSION.includes("development");

function swLog(event, detail) {
  const payload = detail !== undefined ? detail : "";
  if (SW_DEBUG) {
    console.log("[LN COS SW]", event, payload);
    return;
  }
  if (
    event === "nav-offline-fallback" ||
    event === "nav-network-error" ||
    event === "nav-not-ok-no-cache"
  ) {
    console.warn("[LN COS SW]", event, payload);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.all(
        SHELL_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "no-store" });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            swLog("precache-fail", { url, message: err?.message });
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("lncos-") && !ACTIVE_CACHE_NAMES.has(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin")
  ) {
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  if (
    request.destination === "font" ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "fonts.googleapis.com"
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});

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

async function matchCachedNavigation(request) {
  const url = new URL(request.url);
  const exact = await caches.match(request);
  if (exact) return exact;

  const byPath = await caches.match(url.pathname);
  if (byPath) return byPath;

  return null;
}

function offlineHtmlResponse() {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0A0A0A" />
  <title>LN COS — Connexion instable</title>
  <style>
    body { margin:0; min-height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:16px; padding:24px; background:#0A0A0A; color:#f5f5f5; font-family:system-ui,sans-serif; text-align:center; }
    p.brand { font-size:11px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:#d4af37; margin:0; }
    h1 { margin:0; font-size:22px; font-weight:600; }
    p.lead { margin:0; max-width:300px; line-height:1.5; color:#a3a3a3; }
    button { margin-top:8px; padding:12px 24px; border-radius:999px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#efb0c8,#f7c6d7); color:#3a1020; font-weight:700; font-size:15px; }
  </style>
</head>
<body>
  <p class="brand">LN COS</p>
  <h1>Connexion instable</h1>
  <p class="lead">Impossible de charger la page. Vérifiez votre connexion — nouvelle tentative automatique…</p>
  <button type="button" onclick="location.reload()">Réessayer maintenant</button>
  <script>
    if (navigator.onLine) { setTimeout(function(){ location.reload(); }, 1200); }
    window.addEventListener("online", function(){ location.reload(); });
  </script>
</body>
</html>`;
  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function networkFirstWithOfflineFallback(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(request, { cache: "no-store" });

      if (response.ok) {
        const cache = await caches.open(SHELL_CACHE);
        void cache.put(request, response.clone());
        swLog("nav-ok", { pathname, attempt });
        return response;
      }

      swLog("nav-not-ok-no-cache", { pathname, status: response.status, attempt });
      const cached = await matchCachedNavigation(request);
      if (cached) {
        swLog("nav-cached-after-not-ok", pathname);
        return cached;
      }

      // Laisser Next.js / la plateforme gérer les vraies erreurs HTTP (404, 500…)
      return response;
    } catch (err) {
      const isAbort = err?.name === "AbortError";
      swLog(isAbort ? "nav-abort" : "nav-network-error", {
        pathname,
        attempt,
        message: err?.message,
      });
      if (isAbort && attempt === 0) continue;
      break;
    }
  }

  const cached = await matchCachedNavigation(request);
  if (cached) {
    swLog("nav-cached-fallback", pathname);
    return cached;
  }

  const offlinePage = await caches.match("/offline");
  if (offlinePage) {
    swLog("nav-offline-fallback", { pathname, source: "/offline" });
    return offlinePage;
  }

  const home = await caches.match("/");
  if (home) {
    swLog("nav-offline-fallback", { pathname, source: "/" });
    return home;
  }

  swLog("nav-offline-fallback", { pathname, source: "inline-html" });
  return offlineHtmlResponse();
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
