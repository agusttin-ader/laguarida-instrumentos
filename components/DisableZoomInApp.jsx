"use client"

import { useEffect } from 'react'

function shouldDisableZoom() {
  if (typeof window === 'undefined') return false
  const standalone =
    Boolean(window.navigator?.standalone) ||
    window.matchMedia?.('(display-mode: standalone)')?.matches
  const mobile = window.matchMedia?.('(max-width: 768px)')?.matches
  return standalone || mobile
}

/**
 * Bloquea el zoom (pinch y doble tap) en móvil y en modo app (PWA/standalone).
 */
const NO_ZOOM =
  'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1'

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
        shouldDisableZoom() ? NO_ZOOM : original
      )
    }

    apply()
    const mql = window.matchMedia?.('(max-width: 768px)')
    mql?.addEventListener?.('change', apply)

    return () => {
      mql?.removeEventListener?.('change', apply)
      viewport.setAttribute('content', original)
    }
  }, [])

  return null
}
