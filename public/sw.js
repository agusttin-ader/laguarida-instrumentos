/**
 * Service worker retirado: se autodestruye al activarse para liberar visitas
 * atrapadas por la PWA vieja (p. ej. navegador embebido de Instagram).
 */
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(Promise.resolve())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()

      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      await Promise.all(
        clients.map((client) => {
          if (client.url && 'navigate' in client) return client.navigate(client.url)
          return undefined
        })
      )
    })()
  )
})
