var CACHE_NAME = "2022-09-25 10:38";
var urlsToCache = [
  "/english-quiz/",
  "/english-quiz/data/0.tsv",
  "/english-quiz/data/1.tsv",
  "/english-quiz/data/2.tsv",
  "/english-quiz/data/3.tsv",
  "/english-quiz/data/4.tsv",
  "/english-quiz/data/5.tsv",
  "/english-quiz/data/6.tsv",
  "/english-quiz/eraser.svg",
  "/english-quiz/index.js",
  "/english-quiz/model/model.json",
  "/english-quiz/model/group1-shard1of1.bin",
  "/english-quiz/model/worker.js",
  "/english-quiz/mp3/end.mp3",
  "/english-quiz/mp3/correct3.mp3",
  "/english-quiz/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.0.9/dist/signature_pad.umd.min.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.20.0/dist/tf.min.js",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
