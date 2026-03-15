"use client"

import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import PageTransition from './PageTransition'
import PullToRefresh from './PullToRefresh'

const HybridSupportChat = dynamic(() => import('./HybridSupportChat'), { ssr: false })

/** Renderiza Header y Footer solo fuera de /admin para evitar doble header en login */
export default function SiteShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = typeof pathname === 'string' && pathname.startsWith('/admin')

  const handleRefresh = useCallback(() => {
    router.refresh()
  }, [router])

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
      {!isAdmin ? (
        <PullToRefresh onRefresh={handleRefresh}>
          <Header />
          <main className="pb-[calc(68px+env(safe-area-inset-bottom,0px))] md:pb-0 min-h-0">
            <PageTransition key={pathname}>{children}</PageTransition>
          </main>
          <BottomNav />
          <Footer />
        </PullToRefresh>
      ) : (
        <>
          <main>{children}</main>
        </>
      )}
      {!isAdmin && <HybridSupportChat />}
    </>
  )
}
