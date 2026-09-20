const CACHE_NAME = "laurier-offline-v1";
const INDEX_URL = new URL("./index.html", self.location.href).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const res = await fetch(INDEX_URL, { cache: "reload" });
      if (res.ok) await cache.put(INDEX_URL, res.clone());
    } catch (e) {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("laurier-offline-") && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function cacheUrl(cache, url) {
  try {
    const res = await fetch(url, { cache: "reload" });
    if (res.ok || res.type === "opaque") {
      await cache.put(url, res.clone());
      return true;
    }
  } catch (e) {}
  return false;
}

self.addEventListener("message", event => {
  const data = event.data || {};
  const port = event.ports && event.ports[0];
  if (!port) return;

  if (data.type === "CACHE_URLS") {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      let cached = 0;
      const failed = [];
      for (const url of data.urls || []) {
        if (await cacheUrl(cache, url)) cached++;
        else failed.push(url);
      }
      port.postMessage({ ok: failed.length === 0, cached, total: (data.urls || []).length, failed });
    })());
  }

  if (data.type === "CHECK_URLS") {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      let cached = 0;
      const missing = [];
      for (const url of data.urls || []) {
        const hit = await cache.match(url);
        if (hit) cached++;
        else missing.push(url);
      }
      port.postMessage({ ok: missing.length === 0, cached, total: (data.urls || []).length, missing });
    })());
  }
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        if (res.ok) await cache.put(INDEX_URL, res.clone());
        return res;
      } catch (e) {
        return (await caches.match(INDEX_URL)) || Response.error();
      }
    })());
    return;
  }

  if (url.pathname.includes("/songfiles/")) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) {
        event.waitUntil((async () => {
          try {
            const fresh = await fetch(req);
            if (fresh.ok) {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(req, fresh.clone());
            }
          } catch (e) {}
        })());
        return cached;
      }
      const fresh = await fetch(req);
      if (fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, fresh.clone());
      }
      return fresh;
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh.ok || fresh.type === "opaque") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      return Response.error();
    }
  })());
});
