"use client"

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import MenuDrawer from './MenuDrawer'

const LOGO_DARK = '/images/logo/logo-fondo-oscuro.PNG'
const SCROLL_THRESHOLD = 72

function HamburgerIcon({ className }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/' || pathname === ''
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
    "relative inline-flex items-center py-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap text-[#e4e7f0]/85 hover:text-[#fffaf0] transition-colors duration-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-[var(--vintage-gold)] after:transition-all after:duration-500 after:ease-out hover:after:w-full"

  function handleSectionNav(e, sectionId) {
    e.preventDefault()
    if (isHome) {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    try { sessionStorage.setItem('pending-scroll-target', sectionId) } catch { /* empty */ }
    router.push('/')
  }

  const isProductPage = pathname?.startsWith('/guitars/')
  const compactBottom = isProductPage ? 'pb-1 sm:pb-2 md:pb-0' : ''
  const homeCompact = isHome ? 'pt-1 pb-2 sm:pt-3 sm:pb-4 md:pt-0 md:pb-0.5' : ''
  const logoShadowStyle = { filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9)) drop-shadow(0 4px 20px rgba(0,0,0,0.8))' }

  const mobileHeader = (
    <>
      {/* Fuerza header transparente en home móvil para que la imagen del hero ocupe todo el fondo */}
      {isHome && !scrolled && (
        <style dangerouslySetInnerHTML={{
          __html: `@media (max-width:767px){#header-home-mobile-overlay.hero-overlay-header,.hero-overlay-header{background-color:transparent!important;background-image:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;border-bottom:none!important;box-shadow:none!important}}`
        }} />
      )}
      <header
        id={isHome ? 'header-home-mobile-overlay' : undefined}
        aria-label="Cabecera"
        className={`header-mobile md:hidden flex items-center justify-between min-h-[52px] sm:min-h-[56px] py-2 px-4 sm:px-5 left-0 right-0 top-0 relative ${isHome ? 'header-home-mobile hero-overlay-header' : ''} ${scrolled ? 'header-scrolled' : ''}`}
        style={
          isHome && !scrolled
            ? { backgroundColor: 'transparent', borderBottom: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none' }
            : undefined
        }
      >
        {/* Franja oscura transparente de punta a punta (solo en home sin scroll) */}
        {isHome && !scrolled && (
          <div className="absolute inset-0 w-full bg-black/35 pointer-events-none" aria-hidden />
        )}
        <div className="relative z-20 w-12 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="flex items-center justify-center w-12 h-12 -m-2 rounded-xl border-0 text-white/95 hover:text-white bg-black/20 hover:bg-black/28 backdrop-blur-sm no-custom-btn touch-manipulation transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ WebkitTapHighlightColor: 'transparent', tapHighlightColor: 'transparent' }}
          >
            <HamburgerIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          <a
            href="/"
            aria-label="Ir al inicio"
            className="z-10 flex justify-center min-w-0 overflow-visible pointer-events-auto"
            onClick={isHome ? (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } : undefined}
          >
            <span style={logoShadowStyle} className="block w-[200px] sm:w-[240px] max-h-12 sm:max-h-14 overflow-visible">
              <span className="block origin-center scale-[2.05] sm:scale-[2.2] w-full" style={{ transformOrigin: 'center' }}>
                <Image
                  src={LOGO_DARK}
                  alt="La Guarida logo"
                  width={1536}
                  height={1024}
                  priority
                  className="w-full h-auto max-h-12 sm:max-h-14 object-contain block"
                  style={{ objectFit: 'contain' }}
                  quality={82}
                  sizes="(min-width:640px) 240px, 200px"
                />
              </span>
            </span>
          </a>
        </div>
        <div className="relative z-20 w-12 flex-shrink-0" aria-hidden />
      </header>
      <MenuDrawer open={menuOpen} setOpen={setMenuOpen} />
    </>
  )

  return (
    <>
      {/* Header fijo en móvil: sigue al scroll para que siempre esté visible */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60]">{mobileHeader}</div>

      {/* ——— Desktop: header actual sin cambios ——— */}
      <header
        className={`hidden md:block ${scrolled ? 'header-scrolled ' : ''}${isHome ? homeCompact : `pt-0 pb-1.5 ${compactBottom}`} md:bg-transparent md:backdrop-blur-0 md:border-0 relative`}
      >
        <div className="flex items-center justify-between container-tight max-w-4xl relative min-h-[38px]">
          <div className="flex items-center min-w-0 md:justify-start" />

          <a href="/" aria-label="Ir al inicio" className="logo-link block static z-10 pointer-events-auto">
            <div className="relative header-logo-wrapper">
              <Image src={LOGO_DARK} alt="La Guarida logo" width={1536} height={1024} priority style={{ objectFit: 'contain', display: 'block', height: 'auto' }} className="w-[327px] h-auto block" quality={82} sizes="327px" />
            </div>
          </a>

          <nav className="flex items-center justify-end ml-auto shrink-0" aria-label="Navegación principal">
            <div className="flex items-center gap-4 xl:gap-5">
              <a href="/" className={navLinkClass}>Home</a>
              <span className="h-[12px] w-px bg-white/18 flex-shrink-0" aria-hidden />
              <a href="/#about-section" onClick={(e) => handleSectionNav(e, 'about-section')} className={navLinkClass}>Sobre nosotros</a>
              <span className="h-[12px] w-px bg-white/18 flex-shrink-0" aria-hidden />
              <a href="/#seleccion-destacada" onClick={(e) => handleSectionNav(e, 'seleccion-destacada')} className={navLinkClass}>Selección destacada</a>
              <span className="h-[12px] w-px bg-white/18 flex-shrink-0" aria-hidden />
              <a href="/#low-cost" onClick={(e) => handleSectionNav(e, 'low-cost')} className={navLinkClass}>Low cost</a>
              <span className="h-[12px] w-px bg-white/18 flex-shrink-0" aria-hidden />
              <a href="/favoritos" className={navLinkClass}>Favoritos</a>
            </div>
          </nav>
        </div>
        <div className="container-tight max-w-4xl mt-1">
          <AuthIndicator />
        </div>
      </header>
    </>
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
