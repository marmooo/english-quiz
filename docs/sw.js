const CACHE_NAME="2024-03-20 09:51",urlsToCache=["/english-quiz/","/english-quiz/index.js","/english-quiz/data/0.tsv","/english-quiz/data/1.tsv","/english-quiz/data/2.tsv","/english-quiz/data/3.tsv","/english-quiz/data/4.tsv","/english-quiz/data/5.tsv","/english-quiz/data/6.tsv","/english-quiz/worker.js","/english-quiz/model/model.json","/english-quiz/model/group1-shard1of1.bin","/english-quiz/mp3/end.mp3","/english-quiz/mp3/correct3.mp3","/english-quiz/img/surfing-js.png","/english-quiz/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.16.0/dist/tf.min.js","https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})