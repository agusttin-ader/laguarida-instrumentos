'use client'

import { useEffect, useRef, useState } from 'react'

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
