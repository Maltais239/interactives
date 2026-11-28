const CACHE_NAME = "beaumont-offline-v8";
const CHART_REFRESH_TIMEOUT_MS = 2500;
const INDEX_URL = new URL("./index.html", self.location.href).href;
const APP_PATH = new URL("./", self.location.href).pathname;

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
    const olderCaches = (await caches.keys())
      .filter(key => key.startsWith("beaumont-offline-") && key !== CACHE_NAME)
      .reverse();
    const current = await caches.open(CACHE_NAME);
    for (const key of olderCaches) {
      try {
        const previous = await caches.open(key);
        for (const request of await previous.keys()) {
          if (await current.match(request)) continue;
          const response = await previous.match(request);
          if (response) await current.put(request, response);
        }
        await caches.delete(key);
      } catch {
        // Leave the old cache available if its downloads can't be migrated.
      }
    }
    await self.clients.claim();
  })());
});

async function savedResponse(cache, request) {
  return (await cache.match(request)) || (await caches.match(request));
}

async function fetchChart(request) {
  const cache = await caches.open(CACHE_NAME);
  const saved = await savedResponse(cache, request);
  const controller = new AbortController();
  const timeout = saved ? setTimeout(() => controller.abort(), CHART_REFRESH_TIMEOUT_MS) : null;
  try {
    const fresh = await fetch(request, {cache: "no-store", signal: controller.signal});
    if (!fresh.ok) return saved || fresh;
    const chart = await fresh.blob();
    const response = new Response(chart, {status: fresh.status, statusText: fresh.statusText, headers: fresh.headers});
    await cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch {
    return saved || Response.error();
  } finally {
    clearTimeout(timeout);
  }
}

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
        const hit = await savedResponse(cache, url);
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

  if (req.mode === "navigate" && (url.pathname === APP_PATH || url.pathname === new URL(INDEX_URL).pathname)) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req, {cache: "no-cache"});
        const cache = await caches.open(CACHE_NAME);
        if (res.ok) await cache.put(INDEX_URL, res.clone());
        return res;
      } catch (e) {
        return (await savedResponse(await caches.open(CACHE_NAME), INDEX_URL)) || Response.error();
      }
    })());
    return;
  }

  if (url.pathname.includes("/songfiles/")) {
    event.respondWith(fetchChart(req));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await savedResponse(cache, req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh.ok || fresh.type === "opaque") {
        await cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      return Response.error();
    }
  })());
});


