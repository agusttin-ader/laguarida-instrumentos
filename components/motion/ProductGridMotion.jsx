'use client'

import { useLayoutEffect, useRef } from 'react'

/**
 * Activa la animación de entrada de grillas (.product-grid--enter) tras el primer layout.
 */
export default function ProductGridMotion({ children, className = '', ...rest }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    el.classList.add('product-grid--armed')
    return undefined
  }, [])

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  )
}
