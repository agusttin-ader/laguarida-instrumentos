"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import MenuDrawer from './MenuDrawer'
import { scrollToHomeSectionById } from '../lib/homeSectionScroll'
import { SITE_LOGO_SRC } from '../lib/branding/logo'

const LOGO_SRC = SITE_LOGO_SRC
const SCROLL_THRESHOLD = 72
const SCROLL_DELTA = 10
const DESKTOP_HEADER_QUERY = '(min-width: 768px)'

function getInitialDesktopHeader() {
  return false
}

function HamburgerIcon({ className }) {
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/' || pathname === ''
  const [scrolled, setScrolled] = useState(false)
  const [scrollHidden, setScrollHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [homeHeaderSlotEl, setHomeHeaderSlotEl] = useState(null)
  const [isDesktopHeader, setIsDesktopHeader] = useState(getInitialDesktopHeader)
  const [mounted, setMounted] = useState(false)
  const lastScrollYRef = useRef(0)
  const desktopHeaderRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(DESKTOP_HEADER_QUERY)
    const sync = () => setIsDesktopHeader(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let ticking = false
    lastScrollYRef.current = window.scrollY

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const y = window.scrollY
        const prevY = lastScrollYRef.current
        const delta = y - prevY
        const nextScrolled = y > SCROLL_THRESHOLD

        setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))

        if (!nextScrolled || menuOpen) {
          setScrollHidden(false)
        } else if (delta > SCROLL_DELTA) {
          setScrollHidden(true)
        } else if (delta < -SCROLL_DELTA) {
          setScrollHidden(false)
        }

        lastScrollYRef.current = y
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  useEffect(() => {
    if (menuOpen) setScrollHidden(false)
  }, [menuOpen])

  useEffect(() => {
    const el = desktopHeaderRef.current
    if (!el || typeof document === 'undefined') return

    const syncHeight = () => {
      document.documentElement.style.setProperty('--site-header-h', `${el.offsetHeight}px`)
    }

    syncHeight()
    const ro = new ResizeObserver(syncHeight)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pathname, scrolled])

  useEffect(() => {
    if (!isHome) {
      setHomeHeaderSlotEl(null)
      return
    }
    let cancelled = false
    let raf = 0
    function findSlot() {
      if (cancelled) return
      const el = document.getElementById('home-top-mobile-header-slot')
      if (el) {
        setHomeHeaderSlotEl(el)
        return
      }
      raf = window.requestAnimationFrame(findSlot)
    }
    findSlot()
    return () => {
      cancelled = true
      window.cancelAnimationFrame(raf)
    }
  }, [isHome, pathname])

  const navLinkClass =
    "relative inline-flex items-center py-0.5 px-0.5 text-[11px] lg:text-[13px] font-semibold uppercase tracking-[0.13em] whitespace-nowrap text-[#e4e7f0]/85 hover:text-[#fffaf0] transition-colors duration-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-0 after:bg-[var(--vintage-gold)] after:transition-all after:duration-500 after:ease-out hover:after:w-full"

  function handleSectionNav(e, sectionId) {
    e.preventDefault()
    if (isHome) {
      if (scrollToHomeSectionById(sectionId, { behavior: 'smooth' })) {
        try {
          const path = `${window.location.pathname}${window.location.search || ''}#${sectionId}`
          window.history.replaceState(window.history.state, '', path)
        } catch { /* empty */ }
      }
      return
    }
    try { sessionStorage.setItem('pending-scroll-target', sectionId) } catch { /* empty */ }
    router.push('/')
  }

  const desktopHeaderPad = 'md:py-3 lg:py-3.5'
  const headerMotionClass =
    'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
  const headerHideClass = scrollHidden && scrolled ? 'header-scroll-hidden' : ''

  const mobileHeader = (
    <>
      <header
        id={isHome ? 'header-home-mobile-overlay' : undefined}
        aria-label="Cabecera"
        className={`header-mobile site-header-bar md:hidden flex items-center justify-between min-h-[60px] sm:min-h-[62px] py-2.5 sm:py-3 px-4 sm:px-5 left-0 right-0 top-0 ${isHome ? 'header-home-mobile' : ''} ${scrolled ? 'header-scrolled' : ''}`}
      >
        <div className="relative z-20 w-12 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="flex items-center justify-center w-12 h-12 -m-0.5 rounded-lg border-0 text-white/95 hover:text-white bg-black/50 hover:bg-black/60 no-custom-btn touch-manipulation transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ WebkitTapHighlightColor: 'transparent', tapHighlightColor: 'transparent' }}
          >
            <HamburgerIcon className="w-8 h-8" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          <a
            href="/"
            aria-label="Ir al inicio"
            className="z-10 inline-flex justify-center items-center min-w-0 max-w-full overflow-visible pointer-events-auto leading-none"
            onClick={isHome ? (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } : undefined}
          >
            <span className="relative header-logo-wrapper inline-flex max-w-[min(300px,calc(100vw-10rem))] items-center justify-center leading-none">
              {/* img nativo: evita fondo opaco del optimizador de Next/Image en PNG transparente */}
              <img
                src={LOGO_SRC}
                alt="La Guarida logo"
                width={746}
                height={194}
                decoding="async"
                fetchPriority={isHome && !isDesktopHeader ? 'high' : 'low'}
                className="logo-dark h-[40px] w-auto max-h-[42px] sm:h-[42px] sm:max-h-[44px] max-w-[min(280px,72vw)] object-contain block bg-transparent"
              />
            </span>
          </a>
        </div>
        <div className="relative z-20 w-12 flex-shrink-0" aria-hidden />
      </header>
    </>
  )

  const mobileShellClass = `md:hidden fixed top-0 left-0 right-0 z-[var(--z-header)] ${headerMotionClass} ${headerHideClass}`

  const mobileShell = <div className={mobileShellClass}>{mobileHeader}</div>

  return (
    <>
      {isHome
        ? mounted && homeHeaderSlotEl
          ? createPortal(mobileShell, homeHeaderSlotEl)
          : mobileShell
        : mobileShell}
      <MenuDrawer open={menuOpen} setOpen={setMenuOpen} />

      {/* Header desktop */}
      <header
        ref={desktopHeaderRef}
        className={`header-desktop site-header-bar hidden md:block fixed top-0 left-0 right-0 z-[var(--z-header)] ${headerMotionClass} ${headerHideClass} ${scrolled ? 'header-scrolled ' : ''}${desktopHeaderPad} overflow-visible`}
      >
        <div className="flex items-center justify-between gap-4 md:gap-6 container-tight max-w-5xl relative min-h-0 py-0 overflow-visible">
          <a
            href="/"
            aria-label="Ir al inicio"
            className="logo-link static z-10 pointer-events-auto shrink-0 min-w-0 overflow-visible max-w-[240px] sm:max-w-[260px] lg:max-w-[280px]"
          >
            <div className="relative header-logo-wrapper header-desktop-logo-wrap">
              <img
                src={LOGO_SRC}
                alt="La Guarida logo"
                width={746}
                height={194}
                decoding="async"
                fetchPriority={isHome && isDesktopHeader ? 'high' : 'low'}
                className="logo-dark h-[21px] md:h-[22px] lg:h-[24px] xl:h-[26px] min-[1920px]:h-[28px] w-auto max-w-[220px] lg:max-w-[240px] xl:max-w-[250px] object-contain object-left block bg-transparent"
              />
            </div>
          </a>

          <nav className="flex items-center justify-end ml-auto shrink-0 min-w-0 overflow-visible" aria-label="Navegación principal">
            <div className="flex items-center justify-end gap-2.5 xl:gap-3">
              <a href="/" className={navLinkClass}>Home</a>
              <span className="h-[10px] w-px bg-white/18 flex-shrink-0" aria-hidden />
              <a href="/#about-section" onClick={(e) => handleSectionNav(e, 'about-section')} className={navLinkClass}>Sobre nosotros</a>
              <span className="h-[10px] w-px bg-white/18 flex-shrink-0" aria-hidden />
              <a href="/catalogo" className={navLinkClass}>Catálogo</a>
              <span className="h-[10px] w-px bg-white/18 flex-shrink-0" aria-hidden />
              <a href="/favoritos" className={navLinkClass}>Favoritos</a>
            </div>
          </nav>
        </div>
        <div className="container-tight max-w-5xl">
          <AuthIndicator />
        </div>
      </header>
      <div
        className="hidden md:block shrink-0 pointer-events-none h-[var(--site-header-h,68px)]"
        aria-hidden
      />
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
    <div className="hidden md:flex w-full flex-col items-stretch border-t border-white/[0.07] pt-1.5 mt-0.5">
      <div className="flex flex-wrap items-center justify-end gap-2.5 text-[11px] text-white/75">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-white/[0.1] bg-black/25 px-3 py-1 pl-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
          {(online === true || online === false) && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`h-1.5 w-1.5 rounded-full ring-2 ring-white/10 ${online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]' : 'bg-rose-400'}`}
                aria-hidden
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
                {online ? 'En línea' : 'Sin conexión'}
              </span>
            </div>
          )}
          {(online === true || online === false) && (
            <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden />
          )}
          <span className="min-w-0 truncate font-medium tracking-[0.02em] text-[#e4e7f0]/90 sm:max-w-[min(280px,28vw)]">
            {auth.email || 'Admin'}
          </span>
        </div>
        <a
          href="/admin/productos/catalogo"
          className="no-custom-btn inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(var(--palette-gold-rgb),0.42)] bg-[rgba(var(--palette-gold-rgb),0.07)] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--vintage-gold)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition-all duration-300 hover:border-[rgba(var(--palette-gold-rgb),0.62)] hover:bg-[rgba(var(--palette-gold-rgb),0.16)] hover:text-[#fff8e7] hover:shadow-[0_0_20px_rgba(var(--palette-gold-rgb),0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          aria-label="Ir al administrador (catálogo)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-90"
            aria-hidden
          >
            <path
              d="M4 5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M13 5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M4 16a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M13 14a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span>Admin</span>
        </a>
      </div>
    </div>
  )
}
