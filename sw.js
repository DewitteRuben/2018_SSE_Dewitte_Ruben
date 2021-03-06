var cacheName = "v2";
//
var cacheFiles = [
    ".",
    "index.html",
    "addcard.html",
    "addcardset.html",
    "cardgame.html",
    "settings.html",
    "gameoverview.html",
    "css/screen.css",
    "css/materialize.min.css",
    "css/font-awesome.min.css",
    "js/libraries/jquery-3.3.1.min.js",
    "js/libraries/materialize.min.js",
    "js/libraries/materializeinit.js",
    "js/libraries/easytimer.min.js",
    "dist/addcard-bundle.js",
    "dist/addcardset-bundle.js",
    "dist/cardgame-bundle.js",
    "dist/gameoverview-bundle.js",
    "dist/index-bundle.js",
    "dist/settings-bundle.js"
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log("Cashing files");
            return cache.addAll(cacheFiles);
        })
    );
});


self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open(cacheName).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                var fetchPromise = fetch(event.request).then(function (networkResponse) {
                    if (event.request.method === "GET") {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(function () {
                    console.log("Failed to update cache, network unavailable");
                });
                return response || fetchPromise;
            }).catch(function () {
                console.log("Failed to match cache and to update from the network");
            })
        })
    );
});

