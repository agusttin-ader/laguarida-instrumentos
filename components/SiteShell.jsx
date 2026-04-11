"use client"

import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'

const Footer = dynamic(() => import('./Footer'), { ssr: true })
const PullToRefresh = dynamic(() => import('./PullToRefresh'), { ssr: false })

/** Reserva espacio mientras carga el chunk del header (solo cliente; evita mismatch SSR/bundle). */
function HeaderLoading() {
  return (
    <>
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[var(--z-header)] min-h-[52px] sm:min-h-[56px] bg-[var(--dark-bg-page)] pointer-events-none"
        aria-hidden
      />
      <div className="hidden md:block w-full min-h-[88px] lg:min-h-[96px] shrink-0" aria-hidden />
    </>
  )
}

const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: HeaderLoading
})

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
    if (typeof document === 'undefined') return
    const isHome = pathname === '/' || pathname === ''
    if (isHome) document.body.classList.add('page-home')
    else document.body.classList.remove('page-home')
    return () => document.body.classList.remove('page-home')
  }, [pathname])

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
        <>
          <Header />
          <PullToRefresh onRefresh={handleRefresh}>
            <main
              key={pathname}
              className="animate-page-in min-h-0 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:pb-0 pt-0"
              style={{ animationDuration: '0.35s' }}
            >
              {children}
            </main>
            <Footer />
          </PullToRefresh>
        </>
      ) : (
        <main>{children}</main>
      )}
    </>
  )
}
