'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useMatchMedia, usePrefersReducedMotion } from '../../hooks/useMatchMedia'
import { shouldAnimatePageEnter } from '../../lib/motion/pageTransitionPolicy'

const MOBILE_QUERY = '(max-width: 767px)'
const ENTER_ANIMATION_MS = 150

/**
 * Etapa 1: passthrough sin `key` (sin remount). Fade solo en desktop home/legal
 * tras navegación cliente — nunca en la primera carga.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname()
  const isMobile = useMatchMedia(MOBILE_QUERY, true)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [enterActive, setEnterActive] = useState(false)
  const skipFirstNavigation = useRef(true)

  useEffect(() => {
    if (skipFirstNavigation.current) {
      skipFirstNavigation.current = false
      return undefined
    }

    const animate = shouldAnimatePageEnter(pathname, { isMobile, prefersReducedMotion })
    if (!animate) {
      setEnterActive(false)
      return undefined
    }

    setEnterActive(true)
    const timer = window.setTimeout(() => setEnterActive(false), ENTER_ANIMATION_MS)
    return () => window.clearTimeout(timer)
  }, [pathname, isMobile, prefersReducedMotion])

  return (
    <div className={`w-full min-w-0${enterActive ? ' page-route-enter' : ''}`}>
      {children}
    </div>
  )
}