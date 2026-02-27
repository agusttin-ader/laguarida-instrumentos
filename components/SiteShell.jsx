"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'

/** Renderiza Header y Footer solo fuera de /admin para evitar doble header en login */
export default function SiteShell({ children }) {
  const pathname = usePathname()
  const isAdmin = typeof pathname === 'string' && pathname.startsWith('/admin')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    } catch { /* empty */ }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  return (
    <>
      {!isAdmin && <Header />}
      <main className={!isAdmin ? 'pb-[84px] md:pb-0' : ''}>
        {children}
      </main>
      {!isAdmin && <BottomNav />}
      {!isAdmin && <Footer />}
    </>
  )
}
