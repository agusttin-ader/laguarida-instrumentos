"use client"

import { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [isDark, setIsDark] = useState(false)

  useEffect(()=>{
    try {
      const stored = window.localStorage.getItem('theme')
      if (stored === 'dark') {
        document.documentElement.classList.add('dark')
        setIsDark(true)
        return
      }
      if (stored === 'light') {
        document.documentElement.classList.remove('dark')
        setIsDark(false)
        return
      }
      // No explicit preference stored — follow system
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefers) {
        document.documentElement.classList.add('dark')
        setIsDark(true)
      } else {
        document.documentElement.classList.remove('dark')
        setIsDark(false)
      }
    } catch {
      void 0
    }
  }, [])

  function toggle(){
    try {
      const next = !isDark
      setIsDark(next)
      if (next) {
        document.documentElement.classList.add('dark')
        window.localStorage.setItem('theme','dark')
      } else {
        document.documentElement.classList.remove('dark')
        window.localStorage.setItem('theme','light')
      }
      // notify other listeners in same window
      try { window.dispatchEvent(new CustomEvent('theme-change', { detail: next ? 'dark' : 'light' })) } catch { void 0 }
    } catch {
      void 0
    }
  }

  return (
    <button
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      role="switch"
      aria-checked={isDark}
      onClick={toggle}
      className="flex items-center p-0 rounded-full bg-transparent focus:outline-none focus:ring-0"
      style={{ boxShadow: 'none', border: 0 }}
    >
      {/* Desktop-only visual is controlled by parent; this component renders the switch */}
      <div className="hidden md:block">
        <div
          className="relative rounded-full"
          style={{
            width: 44,
            height: 24,
            backgroundColor: isDark ? 'var(--dark-bg-page)' : 'var(--color-white)',
            border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(11,13,15,0.10)'
          }}
        >
          {/* green inner fill when ON (iOS color) */}
          <div
            aria-hidden
            className="absolute left-1 top-1 bottom-1 rounded-full"
            style={{
              backgroundColor: isDark ? '#34C759' : 'transparent',
              width: isDark ? 36 : 0,
              transition: 'width 180ms ease, background-color 180ms ease',
              boxShadow: 'none',
              border: 0
            }}
          />

          {/* knob (no border/shadow per request) */}
          <span
            className="absolute top-1 left-1 bg-white rounded-full"
            style={{
              width: 20,
              height: 20,
              transform: isDark ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 180ms ease',
              boxShadow: 'none',
              border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(11,13,15,0.04)'
            }}
          />
        </div>
      </div>
    </button>
  )
}
