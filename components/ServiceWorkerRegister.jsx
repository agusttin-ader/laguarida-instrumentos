"use client"

import { useEffect } from 'react'

/** La tienda pública ya no usa PWA; retiramos SW viejos que pueden romper WebViews (Instagram). */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        for (const reg of regs) {
          const script = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || ''
          if (!script.includes('sw-admin.js')) reg.unregister()
        }
      })
      .catch(() => {})
  }, [])

  return null
}
