self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('minetrack-static-v1').then((cache) => cache.addAll(['/manifest.webmanifest', '/pwa-icon.svg']))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
