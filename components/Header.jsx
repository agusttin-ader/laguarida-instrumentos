"use client"

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import MenuDrawer from './MenuDrawer'

/** Logo principal (horizontal, fondo oscuro / transparente) — `public/images/logo/logo-fondo-oscuro.PNG` */
const LOGO_SRC = '/images/logo/logo-fondo-oscuro.PNG'
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
    "relative inline-flex items-center py-1 px-0.5 text-[12px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap text-[#e4e7f0]/85 hover:text-[#fffaf0] transition-colors duration-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[var(--vintage-gold)] after:transition-all after:duration-500 after:ease-out hover:after:w-full"

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

  /** Mismo espacio arriba y abajo en desktop (logo + nav centrados en la franja). */
  const desktopHeaderPad = 'md:py-4 lg:py-5'

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
        className={`header-mobile md:hidden flex items-center justify-between min-h-[52px] sm:min-h-[56px] py-2.5 sm:py-2.5 px-2 sm:px-3 left-0 right-0 top-0 relative ${isHome ? 'header-home-mobile hero-overlay-header' : ''} ${scrolled ? 'header-scrolled' : ''}`}
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
        <div className="relative z-20 w-11 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="flex items-center justify-center w-11 h-11 -m-0.5 rounded-lg border-0 text-white/95 hover:text-white bg-black/20 hover:bg-black/28 backdrop-blur-sm no-custom-btn touch-manipulation transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ WebkitTapHighlightColor: 'transparent', tapHighlightColor: 'transparent' }}
          >
            <HamburgerIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center min-w-0 px-1.5">
          <a
            href="/"
            aria-label="Ir al inicio"
            className="z-10 inline-flex justify-center items-center min-w-0 max-w-full overflow-visible pointer-events-auto leading-none"
            onClick={isHome ? (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } : undefined}
          >
            <span className="relative header-logo-wrapper inline-flex max-w-[min(280px,calc(100vw-7rem))] items-center justify-center leading-none">
              <Image
                src={LOGO_SRC}
                alt="La Guarida logo"
                width={1800}
                height={450}
                priority
                className="logo-dark h-[34px] w-auto max-h-[36px] sm:h-[36px] sm:max-h-[38px] object-contain block"
                style={{ objectFit: 'contain' }}
                quality={82}
                sizes="(max-width: 767px) 260px, 160px"
              />
            </span>
          </a>
        </div>
        <div className="relative z-20 w-11 flex-shrink-0" aria-hidden />
      </header>
    </>
  )

  return (
    <>
      {/* Header fijo en móvil: sigue al scroll para que siempre esté visible */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[var(--z-header)]">{mobileHeader}</div>
      <MenuDrawer open={menuOpen} setOpen={setMenuOpen} />

      {/* ——— Desktop: logo alineado a la izquierda; nav a la derecha (evita recorte del scale en el borde) ——— */}
      <header
        className={`header-desktop hidden md:block ${scrolled ? 'header-scrolled ' : ''}${desktopHeaderPad} md:bg-transparent md:backdrop-blur-0 md:border-0 relative overflow-visible`}
      >
        <div className="flex items-center justify-between gap-4 md:gap-6 container-tight max-w-5xl relative min-h-0 py-0 overflow-visible">
          <a
            href="/"
            aria-label="Ir al inicio"
            className="logo-link static z-10 pointer-events-auto shrink-0 min-w-0 overflow-visible max-w-[200px] sm:max-w-[220px]"
          >
            <div className="relative header-logo-wrapper header-desktop-logo-wrap">
              <Image
                src={LOGO_SRC}
                alt="La Guarida logo"
                width={1800}
                height={450}
                priority
                style={{ objectFit: 'contain', display: 'block', height: 'auto' }}
                className="logo-dark h-[18px] md:h-[20px] w-auto max-w-full object-contain object-left block"
                quality={82}
                sizes="(min-width: 768px) 220px, 120px"
              />
            </div>
          </a>

          <nav className="flex items-center justify-end ml-auto shrink-0 min-w-0 overflow-visible" aria-label="Navegación principal">
            <div className="flex items-center justify-end gap-3 xl:gap-4">
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
        <div className="container-tight max-w-5xl">
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
    <div className="hidden md:flex items-center gap-4 text-xs text-gray-300 pt-3 border-t border-white/[0.08]">
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
