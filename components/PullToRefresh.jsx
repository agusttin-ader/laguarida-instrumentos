"use client"

import React, { useCallback, useRef, useState } from 'react'

export default function PullToRefresh({ children, onRefresh, disabled }) {
  const [pull, setPull] = useState(0)
  const startY = useRef(0)
  const scrollTop = useRef(0)
  const pullPending = useRef(0)
  const rafRef = useRef(0)

  const handleTouchStart = useCallback((e) => {
    if (disabled) return
    startY.current = e.touches[0].clientY
    scrollTop.current = document.documentElement.scrollTop || document.body.scrollTop
    pullPending.current = 0
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [disabled])

  const handleTouchMove = useCallback((e) => {
    if (disabled) return
    if (scrollTop.current > 8) return
    const y = e.touches[0].clientY
    const diff = y - startY.current
    if (diff <= 0) return
    pullPending.current = Math.min(diff * 0.5, 80)
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      setPull(pullPending.current)
    })
  }, [disabled])

  const handleTouchEnd = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    const p = pullPending.current
    if (p >= 60 && typeof onRefresh === 'function') {
      onRefresh()
    }
    pullPending.current = 0
    setPull(0)
  }, [onRefresh])

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
