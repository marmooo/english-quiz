const CACHE_NAME="2023-09-07 09:05",urlsToCache=["/english-quiz/","/english-quiz/index.js","/english-quiz/data/0.tsv","/english-quiz/data/1.tsv","/english-quiz/data/2.tsv","/english-quiz/data/3.tsv","/english-quiz/data/4.tsv","/english-quiz/data/5.tsv","/english-quiz/data/6.tsv","/english-quiz/worker.js","/english-quiz/model/model.json","/english-quiz/model/group1-shard1of1.bin","/english-quiz/mp3/end.mp3","/english-quiz/mp3/correct3.mp3","/english-quiz/img/surfing-js.png","/english-quiz/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/signature_pad@4.1.6/dist/signature_pad.umd.min.js","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js","https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"];self.addEventListener("install",a=>{a.waitUntil(caches.open(CACHE_NAME).then(a=>a.addAll(urlsToCache)))}),self.addEventListener("fetch",a=>{a.respondWith(caches.match(a.request).then(b=>b||fetch(a.request)))}),self.addEventListener("activate",a=>{a.waitUntil(caches.keys().then(a=>Promise.all(a.filter(a=>a!==CACHE_NAME).map(a=>caches.delete(a)))))})