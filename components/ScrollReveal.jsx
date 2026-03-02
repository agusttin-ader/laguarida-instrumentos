"use client"

import React, { useEffect, useRef, useState } from 'react'

const ScrollReveal = React.memo(function ScrollReveal({ children, className = '', threshold = 0.12, rootMargin = '0px 0px -8% 0px', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined') return

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(entry.target)
        }
      })
    }, { threshold, rootMargin })

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, rootMargin])

  const style = { '--reveal-delay': `${delay || 0}ms`, transitionDelay: `${delay || 0}ms` }

  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`} style={style}>
      {children}
    </div>
  )
})

export default ScrollReveal
