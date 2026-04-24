'use client'

import { useLayoutEffect } from 'react'

/**
 * Define window.__adminHideSplash sin <script> en el árbol React (React 19 / Next 16).
 * useLayoutEffect corre en el cliente antes del pintado, antes que useEffect de ClientAuth.
 */
export default function RegisterAdminHideSplash() {
  useLayoutEffect(() => {
    window.__adminHideSplash = function adminHideSplash() {
      const el = document.getElementById('admin-boot-splash')
      if (!el) return
      el.classList.add('admin-boot-splash-fade')
      el.setAttribute('aria-hidden', 'true')
      window.setTimeout(() => {
        try {
          el.remove()
        } catch {
          /* empty */
        }
      }, 200)
    }
  }, [])
  return null
}
