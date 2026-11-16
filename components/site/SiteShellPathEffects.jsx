'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getHashSectionId, scrollToHomeSectionByIdWhenReady } from '../../lib/homeSectionScroll'

/** Efectos de documento/scroll del shell — aislados para no mezclar con el markup del layout. */
export default function SiteShellPathEffects() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    } catch { /* empty */ }
  }, [])

  useEffect(() => {
    if (typeof pathname === 'string' && pathname.startsWith('/admin')) return undefined
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
    if (typeof pathname === 'string' && pathname.startsWith('/admin')) return undefined
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
    if (typeof pathname === 'string' && pathname.startsWith('/admin')) return undefined
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

  return null
}