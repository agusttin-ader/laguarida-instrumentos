"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const LOGO_DARK = '/images/logo/logo-fondo-oscuro.PNG'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/' || pathname === ''
  const navLinkClass = "relative inline-flex items-center py-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#dde2eb]/86 hover:text-[#fffaf0] transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-[#d4a43b] after:transition-all after:duration-700 after:ease-out hover:after:w-full"

  function handleSectionNav(e, sectionId) {
    if (!isHome) return
    e.preventDefault()
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className={`${isHome ? 'pt-1 pb-4 sm:pt-4 sm:pb-8 md:pt-2 md:pb-4' : 'pt-2 pb-4 sm:pt-4 sm:pb-8 md:pt-2 md:pb-4'} sticky top-0 z-40 md:static md:z-auto bg-[#1a1a1c]/88 backdrop-blur-md border-b border-white/5 md:bg-transparent md:backdrop-blur-0 md:border-0`}>
      <div className="flex items-center justify-between container-tight max-w-4xl relative min-h-[58px] md:min-h-[56px]">
        <div className="flex items-center min-w-0 md:justify-start">
          <div className="flex items-center">
            <AuthIndicator />
          </div>
        </div>

        <a href="/" aria-label="Ir al inicio" className={`logo-link block absolute left-1/2 -translate-x-1/2 z-10 top-1/2 -translate-y-1/2 pointer-events-none md:pointer-events-auto md:static md:translate-x-0 md:translate-y-0 md:ml-10 ${isHome ? 'sm:translate-y-0 md:translate-y-0' : ''}`}>
          <div className="relative header-logo-wrapper">
            <Image src={LOGO_DARK} alt="La Guarida logo" width={1536} height={1024} priority style={{ objectFit: 'contain', display: 'block', height: 'auto' }} className="w-[222px] sm:w-[282px] md:w-[327px] h-auto block" quality={100} sizes="(min-width:768px) 327px, (min-width:640px) 282px, 222px" />
          </div>
        </a>

        <nav className="hidden md:flex items-center justify-end ml-auto" aria-label="Navegación principal">
          <div className="flex items-center gap-5">
            <a href="/" className={navLinkClass}>Home</a>
            <span className="h-[14px] w-px bg-white/14" aria-hidden />
            <a href="/#about-section" onClick={(e) => handleSectionNav(e, 'about-section')} className={navLinkClass}>Sobre nosotros</a>
            <span className="h-[14px] w-px bg-white/14" aria-hidden />
            <a href="/#seleccion-destacada" onClick={(e) => handleSectionNav(e, 'seleccion-destacada')} className={navLinkClass}>Catalogo</a>
          </div>
        </nav>
      </div>
    </header>
  )
}

function AuthIndicator() {
  const pathname = usePathname()
  const [auth, setAuth] = useState({ loading: true, authenticated: false, email: null })

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

  if (auth.loading) return null
  if (!auth.authenticated) return null
  if (typeof pathname === 'string' && pathname.startsWith('/admin')) return null

  return (
    <div className="hidden md:flex items-center gap-3">
      <div className="text-sm text-gray-300">Sesión: <span className="font-medium">{auth.email || 'Admin'}</span></div>
      <a href="/admin" className="admin-panel-link no-custom-btn">Ir al panel</a>
    </div>
  )
}
