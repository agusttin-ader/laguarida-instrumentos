const CACHE_NAME = 'laguarida-pwa-v1'
const URLS_TO_CACHE = [
  '/',
  '/admin',
  '/admin/loguin',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  event.respondWith(
    fetch(request)
      .then(response => {
        const resClone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, resClone))
        return response
      })
      .catch(() => caches.match(request).then(r => r))
  )
})
