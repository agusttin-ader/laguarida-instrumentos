"use client"

import { useEffect } from 'react'

/**
 * Solo desactiva zoom en PWA (standalone). En el navegador móvil se mantiene
 * el viewport del layout (userScalable: true) para accesibilidad.
 */
function isStandalonePWA() {
  if (typeof window === 'undefined') return false
  return (
    Boolean(window.navigator?.standalone) ||
    window.matchMedia?.('(display-mode: standalone)')?.matches
  )
}

const NO_ZOOM_PWA =
  'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'

export default function DisableZoomInApp() {
  useEffect(() => {
    let viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      viewport = document.createElement('meta')
      viewport.setAttribute('name', 'viewport')
      document.head.appendChild(viewport)
    }

    const original = viewport.getAttribute('content') || DEFAULT_VIEWPORT

    function apply() {
      viewport.setAttribute(
        'content',
        isStandalonePWA() ? NO_ZOOM_PWA : original
      )
    }

    apply()
    const mql = window.matchMedia?.('(display-mode: standalone)')
    mql?.addEventListener?.('change', apply)

    return () => {
      mql?.removeEventListener?.('change', apply)
      viewport.setAttribute('content', original)
    }
  }, [])

  return null
}
