'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** Si la carga supera este umbral, se aplica fade suave al mostrar la imagen. */
export const PREMIUM_IMAGE_FADE_MS = 72

export function usePremiumImageFade(src) {
  const startedAtRef = useRef(0)
  const [loaded, setLoaded] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    startedAtRef.current =
      typeof performance !== 'undefined' ? performance.now() : Date.now()
    setLoaded(false)
    setFadeIn(false)
  }, [src])

  const onImageLoad = useCallback(() => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const elapsed = now - startedAtRef.current
    setFadeIn(elapsed >= PREMIUM_IMAGE_FADE_MS)
    setLoaded(true)
  }, [])

  const opacityClass = loaded ? 'opacity-100' : 'opacity-0'
  const transitionClass =
    loaded && fadeIn
      ? 'transition-opacity duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'
      : 'transition-none'

  return { loaded, fadeIn, onImageLoad, opacityClass, transitionClass }
}
