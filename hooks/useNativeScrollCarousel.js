'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/** Carrusel horizontal con scroll nativo + snap (galería PDP, relacionados, etc.). */
export function useNativeScrollCarousel(slideCount, resetKey) {
  const scrollerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollEndTimer = useRef(0)
  const isProgrammaticScroll = useRef(false)

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el || isProgrammaticScroll.current) return
    const w = el.clientWidth || 1
    const next = Math.max(0, Math.min(slideCount - 1, Math.round(el.scrollLeft / w)))
    setActiveIndex((prev) => (prev === next ? prev : next))
  }, [slideCount])

  const goToIndex = useCallback((index) => {
    const el = scrollerRef.current
    if (!el) return
    const next = Math.max(0, Math.min(slideCount - 1, index))
    const w = el.clientWidth || 0
    if (!w) return

    isProgrammaticScroll.current = true
    setActiveIndex(next)
    el.scrollTo({ left: next * w, behavior: 'smooth' })

    window.clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false
    }, 400)
  }, [slideCount])

  useEffect(() => {
    setActiveIndex(0)
    const el = scrollerRef.current
    if (el) el.scrollLeft = 0
  }, [slideCount, resetKey])

  useEffect(() => () => window.clearTimeout(scrollEndTimer.current), [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || slideCount < 2) return undefined

    const onScroll = () => {
      window.clearTimeout(scrollEndTimer.current)
      scrollEndTimer.current = window.setTimeout(syncIndexFromScroll, 50)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', syncIndexFromScroll)

    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', syncIndexFromScroll)
      window.clearTimeout(scrollEndTimer.current)
    }
  }, [slideCount, resetKey, syncIndexFromScroll])

  return { scrollerRef, activeIndex, goToIndex }
}
