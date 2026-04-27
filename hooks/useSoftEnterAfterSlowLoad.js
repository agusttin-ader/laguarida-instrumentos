'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tras pasar de loading → listo, devuelve true si el loading duró al menos `slowMs`.
 * Sirve para animar la aparición solo cuando la espera fue notable.
 */
export function useSoftEnterAfterSlowLoad(isLoading, slowMs = 420) {
  const [softEnter, setSoftEnter] = useState(false)
  const prevLoadingRef = useRef(undefined)
  const startedRef = useRef(null)

  useEffect(() => {
    const wasLoading = prevLoadingRef.current
    prevLoadingRef.current = isLoading

    if (isLoading && wasLoading !== true) {
      startedRef.current = Date.now()
      setSoftEnter(false)
    }
    if (!isLoading && wasLoading === true && startedRef.current != null) {
      const elapsed = Date.now() - startedRef.current
      setSoftEnter(elapsed >= slowMs)
      startedRef.current = null
    }
  }, [isLoading, slowMs])

  return softEnter
}
