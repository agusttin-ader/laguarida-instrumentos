"use client"

import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'

const Footer = dynamic(() => import('./Footer'), { ssr: true })
const PullToRefresh = dynamic(() => import('./PullToRefresh'), { ssr: false })
const WhatsAppFloatButton = dynamic(() => import('./WhatsAppFloatButton'), { ssr: false })

function HeaderLoading() {
  const pathname = usePathname()
  const isHome = pathname === '/' || pathname === ''
  return (
    <>
      {!isHome ? (
        <div
          className="md:hidden fixed top-0 left-0 right-0 z-[var(--z-header)] min-h-[68px] sm:min-h-[72px] bg-[var(--dark-bg-page)] pointer-events-none"
          aria-hidden
        />
      ) : null}
      <div className="hidden md:block w-full min-h-[88px] lg:min-h-[96px] shrink-0" aria-hidden />
    </>
  )
}

const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: HeaderLoading
})

export default function SiteShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = typeof pathname === 'string' && pathname.startsWith('/admin')
  const isHome = pathname === '/' || pathname === ''
  const mainTopPad = !isHome
    ? 'pt-[calc(66px+max(0.25rem,env(safe-area-inset-top)))] sm:pt-[calc(70px+max(0.25rem,env(safe-area-inset-top)))] md:pt-0'
    : 'pt-0'

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
    if (!targetId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }
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
              className={`min-h-0 pb-[max(1rem,env(safe-area-inset-bottom,0px))] max-md:pb-[max(5.25rem,calc(4.25rem+env(safe-area-inset-bottom)))] md:pb-0 ${mainTopPad}`}
            >
              {children}
            </main>
            <Footer />
            <WhatsAppFloatButton />
          </PullToRefresh>
        </>
      ) : (
        <main>{children}</main>
      )}
    </>
  )
}
