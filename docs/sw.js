var CACHE_NAME="2022-11-28 00:00",urlsToCache=["/english-quiz/","/english-quiz/data/0.tsv","/english-quiz/data/1.tsv","/english-quiz/data/2.tsv","/english-quiz/data/3.tsv","/english-quiz/data/4.tsv","/english-quiz/data/5.tsv","/english-quiz/data/6.tsv","/english-quiz/eraser.svg","/english-quiz/index.js","/english-quiz/model/model.json","/english-quiz/model/group1-shard1of1.bin","/english-quiz/model/worker.js","/english-quiz/mp3/end.mp3","/english-quiz/mp3/correct3.mp3","/english-quiz/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/signature_pad@4.1.4/dist/signature_pad.umd.min.js","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.1.0/dist/tf.min.js","https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})