"use client"

import React, { useCallback, useRef, useState } from 'react'

/**
 * Envuelve el contenido y permite pull-to-refresh en móvil (arrastrar hacia abajo para recargar).
 */
export default function PullToRefresh({ children, onRefresh, disabled }) {
  const [pull, setPull] = useState(0)
  const startY = useRef(0)
  const scrollTop = useRef(0)

  const handleTouchStart = useCallback((e) => {
    if (disabled) return
    startY.current = e.touches[0].clientY
    scrollTop.current = document.documentElement.scrollTop || document.body.scrollTop
  }, [disabled])

  const handleTouchMove = useCallback((e) => {
    if (disabled) return
    if (scrollTop.current > 8) return
    const y = e.touches[0].clientY
    const diff = y - startY.current
    if (diff > 0) setPull(Math.min(diff * 0.5, 80))
  }, [disabled])

  const handleTouchEnd = useCallback(() => {
    if (pull >= 60 && typeof onRefresh === 'function') {
      onRefresh()
    }
    setPull(0)
  }, [pull, onRefresh])

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative"
    >
      {pull > 0 && (
        <div
          className="flex items-center justify-center text-white/70 text-sm py-2 transition-opacity"
          style={{ height: Math.min(pull, 56), opacity: pull / 60 }}
        >
          {pull >= 60 ? 'Soltá para actualizar' : 'Deslizá hacia abajo'}
        </div>
      )}
      {children}
    </div>
  )
}
