var CACHE_NAME = '2021-08-09 00:08';
var urlsToCache = [
  '/english-quiz/',
  '/english-quiz/0.lst',
  '/english-quiz/1.lst',
  '/english-quiz/2.lst',
  '/english-quiz/3.lst',
  '/english-quiz/4.lst',
  '/english-quiz/5.lst',
  '/english-quiz/6.lst',
  '/english-quiz/eraser.svg',
  '/english-quiz/index.js',
  '/english-quiz/model/model.json',
  '/english-quiz/model/group1-shard1of1.bin',
  '/english-quiz/mp3/end.mp3',
  '/english-quiz/mp3/correct3.mp3',
  '/english-quiz/favicon/original.svg',
  '/english-quiz/signature_pad.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
