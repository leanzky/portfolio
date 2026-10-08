/*
 * Offline copy of /ao2-reviewer.
 *
 * Install: fetch the page, then every build asset it references (scripts,
 * styles, and the fonts those styles pull in) so the first visit alone is
 * enough to work offline. After that, the page is network-first with a short
 * timeout (so a new deploy shows up, but a dead connection falls back to the
 * saved copy fast) and build assets are cache-first (their URLs are hashed).
 *
 * Bump CACHE to force every phone to drop what it has saved.
 */
const CACHE = "ao2-reviewer-v1";
const PAGE = "/ao2-reviewer";
const EXTRAS = [
  "/ao2.webmanifest",
  "/ao2/icon-192.png",
  "/ao2/icon-512.png",
  "/ao2/icon-maskable-512.png",
];
const ASSET = /\/_next\/static\/[^"'\\\s)<>]+/g;
const NAVIGATION_TIMEOUT_MS = 4000;

function assetUrls(text) {
  return [...new Set(text.match(ASSET) ?? [])];
}

async function precache() {
  const cache = await caches.open(CACHE);
  const page = await fetch(PAGE, { cache: "reload" });
  if (!page.ok) throw new Error("page " + page.status);
  await cache.put(PAGE, page.clone());

  const assets = assetUrls(await page.text());
  const stylesheets = [];
  await Promise.all(
    assets.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) return;
      await cache.put(url, res.clone());
      if (url.endsWith(".css")) stylesheets.push(await res.text());
    })
  );

  // Fonts are named inside the stylesheets, not in the page itself.
  const nested = stylesheets.flatMap(assetUrls).filter((u) => !assets.includes(u));
  await Promise.all(
    [...new Set(nested), ...EXTRAS].map(async (url) => {
      const res = await fetch(url);
      if (res.ok) await cache.put(url, res);
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NAVIGATION_TIMEOUT_MS);
  try {
    const res = await fetch(request, { signal: controller.signal });
    if (res.ok) await cache.put(PAGE, res.clone());
    return res;
  } catch {
    return (await cache.match(PAGE)) ?? Response.error();
  } finally {
    clearTimeout(timer);
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && url.pathname.replace(/\/$/, "") === PAGE) {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/ao2/")) {
    event.respondWith(cacheFirst(request));
  }
});
