"use client"

import { useEffect } from 'react'
import { SUPABASE_BLOCKED } from '../lib/supabase/mode'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocalhost || SUPABASE_BLOCKED) {
      navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(reg => reg.unregister()))
      return
    }
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {})
      })
    }
  }, [])

  return null
}
