"use client"

import React, { useEffect, useLayoutEffect, useRef } from 'react'

const ScrollReveal = React.memo(function ScrollReveal({
  children,
  className = '',
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  onVisible
}) {
  const ref = useRef(null)
  const onVisibleRef = useRef(onVisible)
  const needsObserver = Boolean(onVisible)

  useEffect(() => {
    onVisibleRef.current = onVisible
  }, [onVisible])

  useLayoutEffect(() => {
    if (!needsObserver || typeof window === 'undefined') return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    queueMicrotask(() => {
      onVisibleRef.current?.()
    })
  }, [needsObserver])

  useEffect(() => {
    if (!needsObserver || typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = ref.current
    if (!el) return undefined

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisibleRef.current?.()
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [needsObserver, threshold, rootMargin])

  return (
    <div
      ref={needsObserver ? ref : undefined}
      className={className}
    >
      {children}
    </div>
  )
})

export default ScrollReveal
