const CACHE_NAME = 'laguarida-pwa-v1'
const OFFLINE_URL = '/offline.html'
const URLS_TO_CACHE = [
  '/',
  '/admin',
  '/admin/login',
  '/manifest.json',
  OFFLINE_URL
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
  const isLocalhost = request.url.startsWith('http://localhost') || request.url.startsWith('http://127.0.0.1')
  if (isLocalhost) {
    event.respondWith(fetch(request))
    return
  }
  event.respondWith(
    fetch(request)
      .then(response => {
        const resClone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, resClone))
        return response
      })
      .catch(() => {
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL).then(r => r || caches.match(request))
        }
        return caches.match(request)
      })
  )
})

self.addEventListener('push', event => {
  let payload = { title: 'La Guarida - Nuevo mensaje', body: '' }
  try {
    if (event.data) payload = event.data.json()
  } catch {
    payload.body = event.data ? event.data.text() : ''
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'La Guarida', {
      body: payload.body || 'Un visitante escribió en el chat.',
      tag: 'laguarida-chat',
      icon: '/images/logo/og-pick-icon.PNG',
      data: { url: '/admin' }
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/admin'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(winList => {
      for (const w of winList) {
        if (w.url.includes('/admin') && 'focus' in w) {
          w.focus()
          return
        }
      }
      if (self.clients.openWindow) self.clients.openWindow(url)
    })
  )
})
