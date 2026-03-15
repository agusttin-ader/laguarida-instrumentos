"use client"

import React, { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const WA_HREF = 'https://wa.me/5491154661749?text=' + encodeURIComponent('Hola, me interesa La Guarida, me podrias dar informacion?')

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
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    try { sessionStorage.setItem('pending-scroll-target', sectionId) } catch { /* empty */ }
    router.push('/')
  }

  function handleChat(e) {
    e.preventDefault()
    close()
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('hybrid-chat:toggle'))
  }

  const linkClass = 'block px-4 py-3 rounded-lg text-[var(--dark-text-primary)] hover:bg-white/10 transition-colors'
  const isFavoritos = pathname === '/favoritos'

  return (
    <div className={`fixed inset-0 z-[10000] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Cerrar menú"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close() } }}
        onClick={close}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <nav
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85%] bg-[var(--dark-bg-surface)] border-r border-white/10 transform shadow-xl transition-transform duration-200 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menú principal"
      >
        <div className="min-h-[36px] sm:min-h-[40px] flex items-center justify-between px-4 border-b border-white/10">
          <span className="text-sm font-semibold text-white/90">Menú</span>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar menú"
            className="p-2 -m-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors no-custom-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
        <ul className="p-3 space-y-0.5">
          <li>
            <Link href="/" onClick={handleHome} className={linkClass}>Inicio</Link>
          </li>
          <li>
            <a href="/#seleccion-destacada" onClick={(e) => handleSection(e, 'seleccion-destacada')} className={linkClass}>Selección destacada</a>
          </li>
          <li>
            <a href="/#low-cost" onClick={(e) => handleSection(e, 'low-cost')} className={linkClass}>Low cost</a>
          </li>
          <li>
            <Link href="/favoritos" onClick={close} className={linkClass}>Favoritos</Link>
          </li>
          <li>
            <a href="/#about-section" onClick={(e) => handleSection(e, 'about-section')} className={linkClass}>Sobre nosotros</a>
          </li>
          <li className="pt-2 mt-2 border-t border-white/10">
            <button type="button" onClick={handleChat} className={`${linkClass} w-full text-left no-custom-btn`}>
              Chat / Asistente
            </button>
          </li>
          <li>
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              onClick={close}
              className={`${linkClass} inline-flex items-center gap-2`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" />
                <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
              </svg>
              WhatsApp
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
