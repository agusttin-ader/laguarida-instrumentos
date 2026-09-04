"use client"

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { scrollToHomeSectionById } from '../lib/homeSectionScroll'
import { layoutShellClassName } from '../lib/layoutShell'
import { SITE_LOGO_SRC } from '../lib/branding/logo'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'

const MenuDrawer = dynamic(() => import('./MenuDrawer'), { ssr: false })

const LOGO_SRC = SITE_LOGO_SRC
const SCROLL_THRESHOLD = 72
const SCROLL_DELTA = 10
const DESKTOP_HEADER_QUERY = '(min-width: 768px)'
const MOBILE_HEADER_QUERY = '(max-width: 767px)'
const WA_HREF = buildWaMeHref(WHATSAPP_DEFAULT_WEB_MESSAGE)

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', kind: 'home' },
  { href: '/catalogo', label: 'Catálogo', kind: 'link' },
  { href: '/favoritos', label: 'Favoritos', kind: 'link' },
  { href: '/#about-section', label: 'Sobre nosotros', kind: 'section', sectionId: 'about-section' },
]

function getInitialDesktopHeader() {
  return false
}

function navItemIsActive(pathname, item) {
  if (item.kind === 'home') return pathname === '/' || pathname === ''
  if (item.href === '/catalogo') {
    return pathname === '/catalogo' || pathname.startsWith('/catalogo/') || /^\/guitars\//.test(pathname)
  }
  if (item.href === '/favoritos') return pathname === '/favoritos' || pathname.startsWith('/favoritos/')
  return false
}

function HamburgerIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h10" />
    </svg>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/' || pathname === ''
  const isProductPage =
    typeof pathname === 'string' && /^\/guitars\/[^/]+$/u.test(pathname)
  const [scrolled, setScrolled] = useState(false)
  const [scrollHidden, setScrollHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktopHeader, setIsDesktopHeader] = useState(getInitialDesktopHeader)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lastScrollYRef = useRef(0)
  const desktopHeaderRef = useRef(null)
  const mobileHeaderRef = useRef(null)
  const mobileShellRef = useRef(null)

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
    const mq = window.matchMedia(MOBILE_HEADER_QUERY)
    const sync = () => setIsMobileViewport(mq.matches)
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
        const isMobile = window.matchMedia(MOBILE_HEADER_QUERY).matches
        const allowScrollHide = isMobile

        setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))

        if (!allowScrollHide || !nextScrolled || menuOpen) {
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
    if (typeof document === 'undefined' || typeof window === 'undefined') return undefined

    const syncBodyClass = () => {
      const isMobile = window.matchMedia(MOBILE_HEADER_QUERY).matches
      const hidden = isMobile && scrollHidden && scrolled
      document.body.classList.toggle('mobile-header-scroll-hidden', hidden)
    }

    syncBodyClass()
    const mq = window.matchMedia(MOBILE_HEADER_QUERY)
    mq.addEventListener('change', syncBodyClass)

    return () => {
      mq.removeEventListener('change', syncBodyClass)
      document.body.classList.remove('mobile-header-scroll-hidden')
    }
  }, [scrollHidden, scrolled])

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return

    const syncHeight = () => {
      const isDesktop = window.matchMedia(DESKTOP_HEADER_QUERY).matches
      const el = isDesktop
        ? desktopHeaderRef.current
        : mobileShellRef.current || mobileHeaderRef.current
      if (!el || el.offsetHeight <= 0) return
      const h = `${el.offsetHeight}px`
      document.documentElement.style.setProperty('--site-header-h', h)
      if (!isDesktop) {
        document.documentElement.style.setProperty('--mobile-header-h', h)
      }
    }

    syncHeight()

    const targets = [
      desktopHeaderRef.current,
      mobileHeaderRef.current,
      mobileShellRef.current,
    ].filter(Boolean)
    if (!targets.length) return

    const ro = new ResizeObserver(syncHeight)
    targets.forEach((target) => ro.observe(target))

    const mq = window.matchMedia(DESKTOP_HEADER_QUERY)
    mq.addEventListener('change', syncHeight)
    window.addEventListener('orientationchange', syncHeight)

    return () => {
      ro.disconnect()
      mq.removeEventListener('change', syncHeight)
      window.removeEventListener('orientationchange', syncHeight)
    }
  }, [pathname, scrolled, mounted, isHome])

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

  function handleHomeClick(e) {
    if (!isHome) return
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const headerMotionClass =
    'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
  const allowScrollHide = isMobileViewport
  const headerHideClass = allowScrollHide && scrollHidden && scrolled ? 'header-scroll-hidden' : ''

  const navLinkBase =
    "relative inline-flex items-center py-1 text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap transition-colors duration-200 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-[var(--vintage-gold)] after:transition-all after:duration-300 after:ease-out"

  const mobileHeader = (
    <>
      <header
        ref={mobileHeaderRef}
        id={isHome ? 'header-home-mobile-overlay' : undefined}
        aria-label="Cabecera"
        className={`header-mobile site-header-bar md:hidden flex items-center justify-between gap-3 min-h-[64px] py-3 px-4 left-0 right-0 top-0 ${isHome ? 'header-home-mobile' : 'header-mobile-internal'} ${isProductPage ? 'header-mobile-product' : ''} ${scrolled ? 'header-scrolled' : ''}`}
      >
        <div className="relative flex min-w-0 flex-1 items-center justify-start">
          <a
            href="/"
            aria-label="Ir al inicio"
            className="inline-flex min-w-0 max-w-full items-center justify-start overflow-visible pointer-events-auto leading-none"
            onClick={handleHomeClick}
          >
            <span className="relative header-logo-wrapper inline-flex max-w-[min(280px,calc(100vw-5.25rem))] items-center justify-start leading-none">
              <img
                src={LOGO_SRC}
                alt="La Guarida logo"
                width={746}
                height={194}
                decoding="async"
                fetchPriority={isHome && !isDesktopHeader ? 'high' : 'low'}
                className="logo-dark h-[34px] w-auto max-h-[36px] max-w-[min(260px,calc(100vw-5.25rem))] object-contain object-left block bg-transparent"
              />
            </span>
          </a>
        </div>
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="header-mobile-menu-btn flex items-center justify-center w-11 h-11 rounded-full border border-white/12 bg-white/[0.03] text-white/90 hover:text-white hover:border-white/20 no-custom-btn touch-manipulation transition-[color,opacity,transform,border-color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ WebkitTapHighlightColor: 'transparent', tapHighlightColor: 'transparent' }}
          >
            <HamburgerIcon className="w-5 h-5" />
          </button>
        </div>
      </header>
    </>
  )

  const mobileShellClass = `site-header-mobile-shell md:hidden fixed top-0 left-0 right-0 z-[var(--z-header)] bg-[var(--dark-bg-card)] ${headerMotionClass} ${headerHideClass}`

  const mobileShell = <div ref={mobileShellRef} className={mobileShellClass}>{mobileHeader}</div>

  return (
    <>
      {mobileShell}
      <MenuDrawer open={menuOpen} setOpen={setMenuOpen} />

      <header
        ref={desktopHeaderRef}
        className={`header-desktop site-header-bar hidden md:block fixed top-0 left-0 right-0 z-[var(--z-header)] ${headerMotionClass} ${headerHideClass} ${scrolled ? 'header-scrolled ' : ''}overflow-visible bg-[var(--dark-bg-card)]`}
      >
        <div className={`${layoutShellClassName} relative flex items-center gap-6 min-h-[4.5rem] px-4 sm:px-5 md:px-8 lg:px-10 min-[1920px]:px-12`}>
          <a
            href="/"
            aria-label="Ir al inicio"
            onClick={handleHomeClick}
            className="logo-link relative z-10 pointer-events-auto shrink-0 min-w-0 overflow-visible"
          >
            <div className="relative header-logo-wrapper header-desktop-logo-wrap flex items-center">
              <img
                src={LOGO_SRC}
                alt="La Guarida logo"
                width={746}
                height={194}
                decoding="async"
                fetchPriority={isHome && isDesktopHeader ? 'high' : 'low'}
                className="logo-dark h-[34px] lg:h-[38px] xl:h-[40px] w-auto max-w-[280px] object-contain object-left block bg-transparent"
              />
            </div>
          </a>

          <nav className="pointer-events-none absolute inset-y-0 left-1/2 hidden md:flex -translate-x-1/2 items-center" aria-label="Navegación principal">
            <ul className="pointer-events-auto flex items-center gap-6 lg:gap-8 xl:gap-10">
              {NAV_ITEMS.map((item) => {
                const active = navItemIsActive(pathname, item)
                const className = `${navLinkBase} ${
                  active
                    ? 'text-white after:w-full'
                    : 'text-white/62 hover:text-white after:w-0 hover:after:w-full'
                }`
                if (item.kind === 'section') {
                  return (
                    <li key={item.label}>
                      <a href={item.href} onClick={(e) => handleSectionNav(e, item.sectionId)} className={className}>
                        {item.label}
                      </a>
                    </li>
                  )
                }
                if (item.kind === 'home') {
                  return (
                    <li key={item.label}>
                      <a href="/" onClick={handleHomeClick} className={className}>
                        {item.label}
                      </a>
                    </li>
                  )
                }
                return (
                  <li key={item.label}>
                    <Link href={item.href} className={className}>
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="relative z-10 ml-auto flex items-center gap-3">
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsAppClick}
              className="no-custom-btn hidden lg:inline-flex items-center gap-2 rounded-full border border-[rgba(var(--palette-gold-rgb),0.42)] bg-[rgba(var(--palette-gold-rgb),0.08)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--vintage-gold)] transition-colors duration-200 hover:border-[rgba(var(--palette-gold-rgb),0.62)] hover:bg-[rgba(var(--palette-gold-rgb),0.14)] hover:text-[#fff6e4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Consultar
            </a>
          </div>
        </div>
        <div className={`${layoutShellClassName} px-4 sm:px-5 md:px-8 lg:px-10 min-[1920px]:px-12`}>
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
      const run = async () => {
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
      }
      const idle = typeof window !== 'undefined' && window.requestIdleCallback
        ? window.requestIdleCallback
        : (cb) => window.setTimeout(cb, 1400)
      idle(run)
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
    <div className="hidden md:flex w-full flex-col items-stretch border-t border-white/[0.06] pt-1.5 pb-2">
      <div className="flex flex-wrap items-center justify-end gap-2.5 text-[11px] text-white/75">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-white/[0.1] bg-black/25 px-3 py-1 pl-2.5">
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
          className="no-custom-btn inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(var(--palette-gold-rgb),0.42)] bg-[rgba(var(--palette-gold-rgb),0.07)] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--vintage-gold)] transition-colors duration-200 hover:border-[rgba(var(--palette-gold-rgb),0.62)] hover:bg-[rgba(var(--palette-gold-rgb),0.16)] hover:text-[#fff8e7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          aria-label="Ir al administrador (catálogo)"
        >
          <span>Admin</span>
        </a>
      </div>
    </div>
  )
}
