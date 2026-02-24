"use client"

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            // registration successful
            console.log('ServiceWorker registrado:', reg.scope)
          })
          .catch(err => {
            console.warn('ServiceWorker falló:', err)
          })
      })
    }
  }, [])

  return null
}
