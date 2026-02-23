"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
// MiniNav removed from header UI per request
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'

export default function Header(){
  const [logoSrc, setLogoSrc] = useState('/images/logo/logo-fondo-claro.PNG')
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(()=>{

    // determine desktop vs mobile so we only render the toggle on desktop
    try {
      const mq = window.matchMedia && window.matchMedia('(min-width: 768px)')
      const setDesktop = (m) => setIsDesktop(Boolean(m && m.matches))
      setDesktop(mq)
      if (mq && mq.addEventListener) mq.addEventListener('change', ({ matches }) => setDesktop(matches))
      else if (mq && mq.addListener) mq.addListener((m) => setDesktop(m.matches))
    } catch { /* ignore */ }

    // If on desktop, ThemeToggle will set theme (from localStorage or system).
    // On mobile we must follow the system preference and NOT allow toggling.
    try {
      const mqPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
      const applyMobilePref = (m) => {
        const prefers = Boolean(m && m.matches)
        if (prefers) {
          document.documentElement.classList.add('dark')
          setLogoSrc('/images/logo/logo-fondo-oscuro.PNG')
        } else {
          document.documentElement.classList.remove('dark')
          setLogoSrc('/images/logo/logo-fondo-claro.PNG')
        }
      }
      // Only apply mobile preference when not explicitly set in localStorage and when viewport is mobile
      const isMobile = !(window.matchMedia && window.matchMedia('(min-width: 768px)').matches)
      const stored = window.localStorage.getItem('theme')
      if (isMobile) {
        applyMobilePref(mqPref)
        if (mqPref && mqPref.addEventListener) mqPref.addEventListener('change', applyMobilePref)
        else if (mqPref && mqPref.addListener) mqPref.addListener(applyMobilePref)
      } else {
        // desktop: follow stored or system but ThemeToggle will handle theme class and dispatch events
        try {
          if (stored === 'dark') {
            document.documentElement.classList.add('dark')
            setLogoSrc('/images/logo/logo-fondo-oscuro.PNG')
          } else if (stored === 'light') {
            document.documentElement.classList.remove('dark')
            setLogoSrc('/images/logo/logo-fondo-claro.PNG')
          } else {
            const prefers = mqPref && mqPref.matches
            if (prefers) {
              document.documentElement.classList.add('dark')
              setLogoSrc('/images/logo/logo-fondo-oscuro.PNG')
            } else {
              document.documentElement.classList.remove('dark')
              setLogoSrc('/images/logo/logo-fondo-claro.PNG')
            }
          }
        } catch { /* empty */ }
      }
    } catch { /* ignore */ }

    // listen for theme changes dispatched by ThemeToggle (desktop only)
    function onTheme(e){
      const val = (e && e.detail) ? e.detail : null
      if (val === 'dark') setLogoSrc('/images/logo/logo-fondo-oscuro.PNG')
      else if (val === 'light') setLogoSrc('/images/logo/logo-fondo-claro.PNG')
    }
    window.addEventListener('theme-change', onTheme)
    return ()=> window.removeEventListener('theme-change', onTheme)
  }, [])

  return (
    <header className="pt-8 pb-12">
      <div className="flex items-center justify-between container-tight relative">
        <div className="flex items-center">
          {/* left: show admin auth indicator (aligned with switch on desktop) */}
          <div className="flex items-center transform md:translate-y-8">
            <AuthIndicator />
          </div>
        </div>

        <a href="/" aria-label="Ir al inicio" className="logo-link block absolute left-1/2 -top-12 transform -translate-x-1/2 z-10">
          <div className="relative header-logo-wrapper">
            <Image src={logoSrc} alt="La Guarida logo" width={320} height={96} priority style={{objectFit:'contain', display:'block', height: 'auto'}} className="w-[220px] md:w-[320px] h-auto block" quality={100} sizes="(min-width:768px) 320px, 220px" />
          </div>
        </a>

        <div className="flex items-center gap-4">
          {/* Desktop-only theme toggle: only render when viewport >= md */}
          {isDesktop ? (
            <div className="flex items-center transform md:translate-y-8">
              <ThemeToggle />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function AuthIndicator(){
  const pathname = usePathname()

  const [auth, setAuth] = useState({ loading: true, authenticated: false, email: null })

  useEffect(() => {
    let mounted = true

    // If we're currently inside the admin area, skip fetching session here.
    if (typeof pathname === 'string' && pathname.startsWith('/admin')) {
      if (mounted) setAuth({ loading: false, authenticated: false, email: null })
      return () => { mounted = false }
    }

    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!mounted) return
        if (!res.ok) return setAuth({ loading: false, authenticated: false, email: null })
        const j = await res.json()
        if (j?.authenticated) setAuth({ loading: false, authenticated: true, email: j.user?.email || null })
        else setAuth({ loading: false, authenticated: false, email: null })
      } catch {
        if (!mounted) return
        setAuth({ loading: false, authenticated: false, email: null })
      }
    })()

    return () => { mounted = false }
  }, [pathname])

  // don't render anything when loading or unauthenticated
  if (auth.loading) return null
  if (!auth.authenticated) return null

  // finally, hide inside admin area to avoid duplicate info there
  if (typeof pathname === 'string' && pathname.startsWith('/admin')) return null

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-700">Sesión: <span className="font-medium">{auth.email || 'Admin'}</span></div>
      <a href="/admin" className="admin-panel-link no-custom-btn">Ir al panel</a>
    </div>
  )
}
