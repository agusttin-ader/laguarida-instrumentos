'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const SLIDE_SELECTOR = '[data-carousel-slide]'

function getSlides(el) {
  if (!el) return []
  return Array.from(el.querySelectorAll(SLIDE_SELECTOR))
}

function indexFromScrollCenter(el) {
  const slides = getSlides(el)
  if (!slides.length) return 0
  const center = el.scrollLeft + el.clientWidth / 2
  let best = 0
  let bestDist = Infinity
  slides.forEach((slide, i) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
    const dist = Math.abs(center - slideCenter)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  })
  return best
}

function scrollToSlideCenter(el, index) {
  const slides = getSlides(el)
  const slide = slides[index]
  if (!slide) return
  const target = slide.offsetLeft - (el.clientWidth - slide.offsetWidth) / 2
  el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
}

/** Carrusel horizontal con scroll nativo + snap (galería PDP, relacionados, etc.). */
export function useNativeScrollCarousel(slideCount, resetKey, options = {}) {
  const align = options.align === 'center' ? 'center' : 'start'
  const scrollerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollEndTimer = useRef(0)
  const isProgrammaticScroll = useRef(false)

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el || isProgrammaticScroll.current) return

    if (align === 'center') {
      const next = indexFromScrollCenter(el)
      setActiveIndex((prev) => (prev === next ? prev : next))
      return
    }

    const w = el.clientWidth || 1
    const next = Math.max(0, Math.min(slideCount - 1, Math.round(el.scrollLeft / w)))
    setActiveIndex((prev) => (prev === next ? prev : next))
  }, [slideCount, align])

  const goToIndex = useCallback(
    (index) => {
      const el = scrollerRef.current
      if (!el) return
      const next = Math.max(0, Math.min(slideCount - 1, index))

      isProgrammaticScroll.current = true
      setActiveIndex(next)

      if (align === 'center') {
        scrollToSlideCenter(el, next)
      } else {
        const w = el.clientWidth || 0
        if (!w) return
        el.scrollTo({ left: next * w, behavior: 'smooth' })
      }

      window.clearTimeout(scrollEndTimer.current)
      scrollEndTimer.current = window.setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 400)
    },
    [slideCount, align]
  )

  useEffect(() => {
    setActiveIndex(0)
    const el = scrollerRef.current
    if (!el) return
    if (align === 'center') {
      requestAnimationFrame(() => scrollToSlideCenter(el, 0))
    } else {
      el.scrollLeft = 0
    }
  }, [slideCount, resetKey, align])

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
