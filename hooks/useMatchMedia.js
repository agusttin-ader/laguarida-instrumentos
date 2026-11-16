'use client'

import { useEffect, useState } from 'react'

/**
 * @param {string} query
 * @param {boolean} [defaultMatches=false] — SSR / primer paint (evita flash de animación en mobile)
 */
export function useMatchMedia(query, defaultMatches = false) {
  const [matches, setMatches] = useState(defaultMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia(query)
    const sync = () => setMatches(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])

  return matches
}

export function usePrefersReducedMotion() {
  const reduced = useMatchMedia('(prefers-reduced-motion: reduce)', false)
  return reduced
}