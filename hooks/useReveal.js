'use client'

import { useLayoutEffect, useRef, useState } from 'react'

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isInViewport(el, margin = 48) {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight + margin && rect.bottom > -margin
}

/**
 * Revela un elemento al entrar en viewport. SSR-safe: sin opacity:0 en el HTML inicial.
 */
export function useReveal({
  threshold = 0.06,
  rootMargin = '0px 0px -6% 0px',
  delay = 0,
  disabled = false,
} = {}) {
  const ref = useRef(null)
  const [phase, setPhase] = useState('idle')

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || disabled) {
      setPhase('visible')
      return undefined
    }

    if (prefersReducedMotion()) {
      setPhase('visible')
      return undefined
    }

    const reveal = () => {
      setPhase('visible')
    }

    const inView = isInViewport(el)

    if (inView) {
      if (delay > 0) {
        const timer = window.setTimeout(reveal, delay * 1000)
        return () => window.clearTimeout(timer)
      }
      reveal()
      return undefined
    }

    setPhase('hidden')

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          if (delay > 0) {
            window.setTimeout(reveal, delay * 1000)
          } else {
            reveal()
          }
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, delay, disabled])

  return { ref, phase }
}
