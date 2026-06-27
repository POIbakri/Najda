// Najda service worker — app-shell offline support.
// Strategy: network-first for navigations (fresh when online, cached shell when
// offline); cache-first for same-origin static assets; OSM tiles cached at
// runtime with a small cap so the map still draws on a dropped signal.

// Version comes from the registration URL (/sw.js?v=<build>), so a new deploy
// changes the cache names and the install/activate lifecycle purges the old shell.
const BUILD = new URL(self.location.href).searchParams.get("v") || "v1";
const VERSION = `najda-${BUILD}`;
const SHELL = `${VERSION}-shell`;
const STATIC = `${VERSION}-static`;
const TILES = `${VERSION}-tiles`;
const TILE_LIMIT = 120;

const SHELL_URLS = ["/", "/sos", "/respond", "/dashboard", "/onboarding", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(SHELL_URLS).catch(() => {})).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // OpenStreetMap tiles — runtime cache, cap the size.
  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(
      caches.open(TILES).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        try {
          const res = await fetch(request);
          cache.put(request, res.clone());
          trimCache(TILES, TILE_LIMIT);
          return res;
        } catch {
          return hit || Response.error();
        }
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to the cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Only persist a healthy shell — never let a transient 404/500 HTML page
          // on /sos or /status/[id] poison the offline fallback.
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  // Same-origin static assets: cache-first.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(STATIC).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        }).catch(() => hit || Response.error()),
    ),
  );
});
