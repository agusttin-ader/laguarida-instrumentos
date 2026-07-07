"use client"

import { useEffect } from 'react'

/** La tienda pública ya no usa PWA; retiramos SW viejos que pueden romper WebViews (Instagram). */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    async function purgeLegacyPwa() {
      try {
        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(keys.map((key) => caches.delete(key)))
        }

        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          regs.map(async (reg) => {
            const script =
              reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || ''
            if (!script.includes('sw-admin.js')) {
              await reg.unregister()
            }
          })
        )
      } catch {
        /* ignore */
      }
    }

    purgeLegacyPwa()
  }, [])

  return null
}
