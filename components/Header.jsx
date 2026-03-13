"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const LOGO_DARK = '/images/logo/logo-fondo-oscuro.PNG'
const SCROLL_THRESHOLD = 72

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/' || pathname === ''
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkClass =
    "relative inline-flex items-center py-1.5 px-0.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#e4e7f0]/85 hover:text-[#fffaf0] transition-colors duration-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-[var(--vintage-gold)] after:transition-all after:duration-500 after:ease-out hover:after:w-full"

  function handleSectionNav(e, sectionId) {
    if (!isHome) return
    e.preventDefault()
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const isProductPage = pathname?.startsWith('/guitars/')
  const compactBottom = isProductPage ? 'pb-1 sm:pb-2 md:pb-0' : ''
  // Desktop (md+): header al mínimo cómodo; mobile/sm se mantiene igual
  const homeCompact = isHome ? 'pt-1 pb-2 sm:pt-3 sm:pb-4 md:pt-0 md:pb-0.5' : ''
  return (
    <header className={`${scrolled ? 'header-scrolled ' : ''}${isHome ? homeCompact : `pt-2 pb-4 sm:pt-4 sm:pb-8 md:pt-0 md:pb-1.5 ${compactBottom}`} sticky top-0 z-40 md:static md:z-auto bg-[var(--dark-bg-page)]/92 backdrop-blur-md border-b border-white/5 md:bg-transparent md:backdrop-blur-0 md:border-0`}>
      <div className="flex items-center justify-between container-tight max-w-4xl relative min-h-[58px] md:min-h-[38px]">
        <div className="flex items-center min-w-0 md:justify-start" />

        <a href="/" aria-label="Ir al inicio" className={`logo-link block absolute left-1/2 -translate-x-1/2 z-10 top-1/2 -translate-y-1/2 pointer-events-none md:pointer-events-auto md:static md:translate-x-0 md:translate-y-0 md:ml-10 ${isHome ? 'sm:translate-y-0 md:translate-y-0' : ''}`}>
          <div className="relative header-logo-wrapper">
            <Image src={LOGO_DARK} alt="La Guarida logo" width={1536} height={1024} priority style={{ objectFit: 'contain', display: 'block', height: 'auto' }} className="w-[222px] sm:w-[282px] md:w-[327px] h-auto block" quality={100} sizes="(min-width:768px) 327px, (min-width:640px) 282px, 222px" />
          </div>
        </a>

        <nav className="hidden md:flex items-center justify-end ml-auto" aria-label="Navegación principal">
          <div className="flex items-center gap-6">
            <a href="/" className={navLinkClass}>Home</a>
            <span className="h-[12px] w-px bg-white/18 flex-shrink-0" aria-hidden />
            <a href="/#about-section" onClick={(e) => handleSectionNav(e, 'about-section')} className={navLinkClass}>Sobre nosotros</a>
            <span className="h-[12px] w-px bg-white/18 flex-shrink-0" aria-hidden />
            <a href="/#seleccion-destacada" onClick={(e) => handleSectionNav(e, 'seleccion-destacada')} className={navLinkClass}>Catalogo</a>
            <span className="h-[12px] w-px bg-white/18 flex-shrink-0" aria-hidden />
            <a href="/favoritos" className={navLinkClass}>
              Favoritos
            </a>
          </div>
        </nav>
      </div>
      <div className="container-tight max-w-4xl mt-1 hidden md:block">
        <AuthIndicator />
      </div>
    </header>
  )
}

function AuthIndicator() {
  const pathname = usePathname()
  const [auth, setAuth] = useState({ loading: true, authenticated: false, email: null })
  const [online, setOnline] = useState(null)

  useEffect(() => {
    let mounted = true
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    setOnline(navigator.onLine)
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (auth.loading) return null
  if (!auth.authenticated) return null
  if (typeof pathname === 'string' && pathname.startsWith('/admin')) return null

  return (
    <div className="hidden md:flex items-center gap-4 text-xs text-gray-300">
      {(online === true || online === false) && (
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-rose-500'}`}
            aria-hidden
          />
          <span className="text-[11px] text-white/80">
            {online ? 'En línea' : 'Sin conexión'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-gray-100 truncate max-w-[220px]">{auth.email || 'Admin'}</span>
      </div>
      <a
        href="/admin"
        className="no-custom-btn inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/[0.03] text-[11px] font-medium text-white/90 hover:bg-white/[0.08] transition-colors"
        aria-label="Ir al panel de administración"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16V8A1.5 1.5 0 0 1 5 6.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 18.5h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Admin</span>
      </a>
    </div>
  )
}
