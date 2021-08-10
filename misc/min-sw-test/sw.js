// Caching is not really "minimal," but I decided to include it to better
// demonstrate that reloading won't show old cached versions.

console.log('Service worker v5')

self.addEventListener('install', e => {
  e.waitUntil(
    caches
      .open('whoa')
      .then(cache => cache.addAll(['./']))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request))
})
