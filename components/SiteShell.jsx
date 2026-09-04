"use client"

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { getHashSectionId, scrollToHomeSectionByIdWhenReady } from '../lib/homeSectionScroll'
import Header from './Header'
import Footer from './Footer'

const WhatsAppFloatButton = dynamic(() => import('./WhatsAppFloatButton'), { ssr: false })

export default function SiteShell({ children }) {
  const pathname = usePathname()
  const isAdmin = typeof pathname === 'string' && pathname.startsWith('/admin')
  const isHome = pathname === '/' || pathname === ''
  const mainTopPad = !isHome ? 'md:pt-0' : 'pt-0'

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    } catch { /* empty */ }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const isHomePage = pathname === '/' || pathname === ''
    const isProduct =
      typeof pathname === 'string' && /^\/guitars\/[^/]+$/u.test(pathname)

    document.body.classList.toggle('page-home', isHomePage)
    document.body.classList.toggle('page-internal', !isHomePage)
    document.body.classList.toggle('page-product', isProduct)

    return () => {
      document.body.classList.remove('page-home', 'page-internal', 'page-product')
    }
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname !== '/' && pathname !== '') return

    let targetId = null
    try {
      targetId = sessionStorage.getItem('pending-scroll-target')
      if (targetId) sessionStorage.removeItem('pending-scroll-target')
    } catch { /* empty */ }

    const hashId = getHashSectionId()
    const id = targetId || hashId

    if (!id) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    if (id === 'home-top') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      return
    }

    scrollToHomeSectionByIdWhenReady(id, { behavior: 'smooth' })
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname !== '/' && pathname !== '') return

    function onHashChange() {
      const id = getHashSectionId()
      if (!id) return
      if (id === 'home-top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      scrollToHomeSectionByIdWhenReady(id, { behavior: 'smooth' })
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [pathname])

  const mainMobileBottomPad = 'max-md:pb-[max(3.5rem,calc(2.75rem+env(safe-area-inset-bottom)))]'

  return (
    <>
      {!isAdmin ? (
        <>
          <Header />
          <main
            className={`min-h-0 w-full min-w-0 max-md:overflow-x-clip pb-[max(1rem,env(safe-area-inset-bottom,0px))] ${mainMobileBottomPad} md:pb-0 ${mainTopPad}`}
          >
            {children}
          </main>
          <Footer />
          <WhatsAppFloatButton />
        </>
      ) : (
        <main>{children}</main>
      )}
    </>
  )
}
