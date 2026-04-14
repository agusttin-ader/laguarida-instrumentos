"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Aparición al entrar en viewport: desktop = fade + slide (ver `.reveal` en globals);
 * móvil &lt; md = sin transición (CSS); `prefers-reduced-motion` = visible al instante.
 */
const ScrollReveal = React.memo(function ScrollReveal({
  children,
  className = '',
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  delay = 0,
  onVisible
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const onVisibleRef = useRef(onVisible)

  useEffect(() => {
    onVisibleRef.current = onVisible
  }, [onVisible])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setVisible(true)
    queueMicrotask(() => {
      onVisibleRef.current?.()
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = ref.current
    if (!el) return undefined

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            onVisibleRef.current?.()
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, rootMargin])

  const style = { '--reveal-delay': `${delay || 0}ms` }

  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`} style={style}>
      {children}
    </div>
  )
})

export default ScrollReveal
