"use client"

import React, { useEffect, useState } from 'react'

const DEFAULT_BG = 'admin-1.jpeg'

function bgUrl(fileName) {
  return `/images/admin-fondo/${encodeURIComponent(String(fileName || '').trim())}`
}

/**
 * Fondo con imagen solo cuando el admin se abre desde la app instalada (iOS/PWA standalone).
 * No se muestra en login ni en escritorio.
 */
export default function AdminPanelAppBackground() {
  const [isApp, setIsApp] = useState(false)
  const [bgImage, setBgImage] = useState(DEFAULT_BG)

  useEffect(() => {
    const standalone =
      Boolean(typeof window !== 'undefined' && window.navigator?.standalone) ||
      (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)')?.matches)
    if (!standalone) return
    setIsApp(true)

    // Opcional: misma imagen aleatoria que el login
    let cancelled = false
    fetch('/api/admin-backgrounds', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return
        const images = Array.isArray(json?.images) ? json.images : []
        if (images.length) {
          const picked = images[Math.floor(Math.random() * images.length)]
          if (picked) setBgImage(picked)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!isApp) return null

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('${bgUrl(bgImage)}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.72) 100%)'
        }}
        aria-hidden
      />
    </>
  )
}
