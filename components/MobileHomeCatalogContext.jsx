"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from 'react'

const MOBILE_MQ = '(max-width: 768px)'

function subscribeMobile(cb) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia(MOBILE_MQ)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches
}

function getMobileServerSnapshot() {
  return false
}

const MobileHomeCatalogContext = createContext(null)

/**
 * Vista “subpágina” del home solo en viewport ≤768px.
 * En desktop `effectiveView` es siempre `landing`.
 */
export function MobileHomeCatalogProvider({ children }) {
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot)
  const [view, setViewState] = useState(() => /** @type {'landing' | 'featured' | 'lowCost'} */ ('landing'))

  const setView = useCallback((next) => {
    if (typeof window !== 'undefined' && next === 'landing') {
      const path = `${window.location.pathname}${window.location.search || ''}`
      if (window.location.hash) {
        window.history.replaceState(window.history.state, '', path)
      }
    }
    setViewState(next)
  }, [])

  const effectiveView = isMobile ? view : 'landing'

  useEffect(() => {
    if (typeof document === 'undefined') return
    const sub = isMobile && view !== 'landing'
    document.body.classList.toggle('mobile-home-catalog-subview', sub)
    return () => {
      document.body.classList.remove('mobile-home-catalog-subview')
    }
  }, [isMobile, view])

  useEffect(() => {
    if (typeof window === 'undefined' || !isMobile) return
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    scrollTop()
    const t0 = window.setTimeout(scrollTop, 0)
    const t1 = window.setTimeout(scrollTop, 120)
    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
    }
  }, [view, isMobile])

  const value = useMemo(
    () => ({ view, setView, effectiveView, isMobile }),
    [view, setView, effectiveView, isMobile]
  )

  return <MobileHomeCatalogContext.Provider value={value}>{children}</MobileHomeCatalogContext.Provider>
}

export function useMobileHomeCatalog() {
  const ctx = useContext(MobileHomeCatalogContext)
  if (!ctx) {
    return {
      view: 'landing',
      setView: () => {},
      effectiveView: 'landing',
      isMobile: false
    }
  }
  return ctx
}
