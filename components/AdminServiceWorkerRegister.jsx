"use client"

import { useEffect } from 'react'

export default function AdminServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw-admin.js').catch(() => {})
      })
    }
  }, [])

  return null
}
