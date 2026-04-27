'use client'

import { useLayoutEffect } from 'react'

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
