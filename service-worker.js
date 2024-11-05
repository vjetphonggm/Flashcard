// Install event: Cache important assets for offline use
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('flashcard-cache-v1').then(function (cache) {
            return cache.addAll([
                './', // Root URL (index.html)
                './index.html', // Main HTML file
                './css/base.css', // CSS file
                './css/style.css', // Another CSS file
                './img/logo.png', // Logo image
                './img/icon-192x192.png', // App icon (small)
                './img/icon-512x512.png', // App icon (large)
                './app.js', // Main JavaScript file
            ]);
        }),
    );
});

// Fetch event: Serve cached files if available, otherwise fetch from network
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        }),
    );
});
