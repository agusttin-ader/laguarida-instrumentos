"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import HybridSupportChat from './HybridSupportChat'

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname !== '/') return
    let targetId = null
    try {
      targetId = sessionStorage.getItem('pending-scroll-target')
      if (targetId) sessionStorage.removeItem('pending-scroll-target')
    } catch { /* empty */ }
    if (!targetId) return
    requestAnimationFrame(() => {
      if (targetId === 'home-top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const el = document.getElementById(targetId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [pathname])

  return (
    <>
      {!isAdmin && <Header />}
      <main className={!isAdmin ? 'pb-[84px] md:pb-0' : ''}>
        {children}
      </main>
      {!isAdmin && <BottomNav />}
      {!isAdmin && <Footer />}
      {!isAdmin && <HybridSupportChat />}
    </>
  )
}
