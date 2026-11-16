'use client'

import { useLayoutEffect } from 'react'

const SPLASH_MAX_MS = 900

export default function RegisterAdminHideSplash() {
  useLayoutEffect(() => {
    let removed = false
    window.__adminHideSplash = function adminHideSplash() {
      if (removed) return
      const el = document.getElementById('admin-boot-splash')
      if (!el) return
      removed = true
      el.classList.add('admin-boot-splash-fade')
      el.setAttribute('aria-hidden', 'true')
      window.setTimeout(() => {
        try {
          el.remove()
        } catch {
          /* empty */
        }
      }, 220)
    }

    const hideSoon = () => window.__adminHideSplash?.()

    const fallback = window.setTimeout(hideSoon, SPLASH_MAX_MS)
    const onPageShow = () => hideSoon()
    window.addEventListener('pageshow', onPageShow)

    // Mobile: no esperar hydration lenta del bundle de auth
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(hideSoon)
    })

    return () => {
      removed = true
      window.clearTimeout(fallback)
      window.cancelAnimationFrame(raf)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])
  return null
}