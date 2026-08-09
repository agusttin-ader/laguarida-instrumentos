"use client"

import React, { useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'
import { scrollToHomeSectionById } from '../lib/homeSectionScroll'
import { SITE_LOGO_SRC } from '../lib/branding/logo'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'

const LOGO_SRC = SITE_LOGO_SRC
const WA_HREF = buildWaMeHref(WHATSAPP_DEFAULT_WEB_MESSAGE)

function ChevronRight({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export default function MenuDrawer({ open, setOpen }) {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/' || pathname === ''

  useEffect(() => {
    try {
      if (open) document.body.classList.add('menu-open')
      else document.body.classList.remove('menu-open')
    } catch { /* empty */ }
    return () => { try { document.body.classList.remove('menu-open') } catch { /* empty */ } }
  }, [open])

  const close = useCallback(() => setOpen(false), [setOpen])

  function handleHome(e) {
    e.preventDefault()
    close()
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    try { sessionStorage.setItem('pending-scroll-target', 'home-top') } catch { /* empty */ }
    router.push('/')
  }

  function handleSection(e, sectionId) {
    e.preventDefault()
    close()
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

  function handleWhatsAppClick() {
    trackWhatsAppClick()
    close()
  }

  const rowClass =
    'no-custom-btn flex w-full min-h-[4rem] items-center justify-between gap-4 py-5 pl-5 pr-4 text-left text-[1.2rem] font-semibold leading-snug tracking-tight text-[var(--dark-text-primary)] border-b border-white/[0.07] transition-[background-color,color] duration-200 hover:bg-white/[0.04] active:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--vintage-gold)]/45'

  return (
    <div className={`fixed inset-0 z-[var(--z-menu-drawer)] md:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Cerrar menú"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close() } }}
        onClick={close}
        className={`fixed inset-0 z-0 bg-black/60 transition-opacity duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <nav
        className={`menu-drawer-panel menu-drawer-panel--right fixed inset-y-0 right-0 left-auto z-10 flex h-full w-[88%] max-w-[400px] flex-col border-l border-white/10 bg-[var(--dark-bg-page)] shadow-[-24px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Menú principal"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4">
          <Link href="/" onClick={handleHome} className="relative block min-w-0 max-w-[min(240px,calc(100vw-5rem))] py-0.5" aria-label="Ir al inicio">
            <Image
              src={LOGO_SRC}
              alt="La Guarida"
              width={1800}
              height={450}
              className="h-9 w-auto max-h-[2.35rem] object-contain object-left"
              style={{ objectFit: 'contain' }}
              quality={68}
              sizes="260px"
              loading="lazy"
            />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar menú"
            className="no-custom-btn flex h-12 w-12 shrink-0 items-center justify-center text-white/90 hover:text-white"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
          <li>
            <Link href="/" onClick={handleHome} className={rowClass}>
              <span>Inicio</span>
              <ChevronRight className="shrink-0 text-white/35" />
            </Link>
          </li>
          <li>
            <Link href="/catalogo" onClick={close} className={rowClass}>
              <span>Catálogo</span>
              <ChevronRight className="shrink-0 text-white/35" />
            </Link>
          </li>
          <li>
            <Link href="/favoritos" onClick={close} className={rowClass}>
              <span>Favoritos</span>
              <ChevronRight className="shrink-0 text-white/35" />
            </Link>
          </li>
          <li>
            <a href="/#about-section" onClick={(e) => handleSection(e, 'about-section')} className={rowClass}>
              <span>Sobre nosotros</span>
              <ChevronRight className="shrink-0 text-white/35" />
            </a>
          </li>
          <li>
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              onClick={handleWhatsAppClick}
              className={`${rowClass} border-b-0`}
            >
              <span className="inline-flex items-center gap-3">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-[var(--vintage-gold)]">
                  <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" />
                  <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
                </svg>
                WhatsApp
              </span>
              <ChevronRight className="shrink-0 text-white/35" />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
