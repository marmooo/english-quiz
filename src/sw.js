const cacheName = "2025-11-21 00:00";
const urlsToCache = [
  "/english-quiz/index.js",
  "/english-quiz/data/0.tsv",
  "/english-quiz/data/1.tsv",
  "/english-quiz/data/2.tsv",
  "/english-quiz/data/3.tsv",
  "/english-quiz/data/4.tsv",
  "/english-quiz/data/5.tsv",
  "/english-quiz/data/6.tsv",
  "/english-quiz/worker.js",
  "/english-quiz/model/model.json",
  "/english-quiz/model/group1-shard1of1.bin",
  "/english-quiz/mp3/end.mp3",
  "/english-quiz/mp3/correct3.mp3",
  "/english-quiz/img/surfing-js.png",
  "/english-quiz/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((e) => console.warn("Failed to cache", url, e))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
