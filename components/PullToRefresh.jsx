"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'

const PULL_THRESHOLD = 60
const PULL_MAX = 80
const SCROLL_TOP_MAX = 8
const GESTURE_LOCK_PX = 8
const VERTICAL_PULL_BIAS = 1.2

const HORIZONTAL_CAROUSEL_SELECTOR =
  '.native-mobile-carousel, .product-gallery-mobile-carousel, .related-products-scroll'

function isInHorizontalCarousel(target) {
  return target instanceof Element && Boolean(target.closest(HORIZONTAL_CAROUSEL_SELECTOR))
}

function isVerticalPullGesture(dx, dy) {
  return dy > GESTURE_LOCK_PX && dy > Math.abs(dx) * VERTICAL_PULL_BIAS
}

export default function PullToRefresh({ children, onRefresh, disabled }) {
  const [pull, setPull] = useState(0)
  const containerRef = useRef(null)
  const pullPending = useRef(0)
  const rafRef = useRef(0)

  const isBlocked = useCallback(() => {
    if (typeof document === 'undefined') return false
    return document.body.classList.contains('modal-open') || document.body.classList.contains('menu-open')
  }, [])

  const schedulePullUpdate = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      setPull(pullPending.current)
    })
  }, [])

  const resetPull = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    pullPending.current = 0
    setPull(0)
  }, [])

  useEffect(() => {
    const root = containerRef.current
    if (!root || disabled) return undefined

    const gesture = {
      startY: 0,
      startX: 0,
      scrollTop: 0,
      decided: false,
      vertical: false,
    }

    const onTouchStart = (event) => {
      if (isBlocked() || event.touches.length !== 1) return
      gesture.startY = event.touches[0].clientY
      gesture.startX = event.touches[0].clientX
      gesture.scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0
      gesture.decided = false
      gesture.vertical = false
      pullPending.current = 0
      resetPull()
    }

    const onTouchMove = (event) => {
      if (isBlocked() || event.touches.length !== 1) return
      if (gesture.scrollTop > SCROLL_TOP_MAX) return

      const y = event.touches[0].clientY
      const x = event.touches[0].clientX
      const dy = y - gesture.startY
      const dx = x - gesture.startX

      if (!gesture.decided && (Math.abs(dx) > GESTURE_LOCK_PX || Math.abs(dy) > GESTURE_LOCK_PX)) {
        gesture.decided = true
        if (isVerticalPullGesture(dx, dy)) {
          gesture.vertical = true
        } else if (isInHorizontalCarousel(event.target) && Math.abs(dx) > Math.abs(dy)) {
          gesture.vertical = false
        } else {
          gesture.vertical = Math.abs(dy) > Math.abs(dx)
        }
      }

      if (!gesture.decided || !gesture.vertical) return
      if (dy <= 0) {
        if (pullPending.current > 0) resetPull()
        return
      }

      event.preventDefault()
      pullPending.current = Math.min(dy * 0.5, PULL_MAX)
      schedulePullUpdate()
    }

    const onTouchEnd = () => {
      const p = pullPending.current
      if (p >= PULL_THRESHOLD && typeof onRefresh === 'function') {
        onRefresh()
      }
      resetPull()
      gesture.decided = false
      gesture.vertical = false
    }

    root.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
    root.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
    root.addEventListener('touchend', onTouchEnd, { capture: true, passive: true })
    root.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: true })

    return () => {
      root.removeEventListener('touchstart', onTouchStart, { capture: true })
      root.removeEventListener('touchmove', onTouchMove, { capture: true })
      root.removeEventListener('touchend', onTouchEnd, { capture: true })
      root.removeEventListener('touchcancel', onTouchEnd, { capture: true })
      resetPull()
    }
  }, [disabled, isBlocked, onRefresh, resetPull, schedulePullUpdate])

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      {pull > 0 ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[var(--z-header)] flex items-end justify-center overflow-hidden text-sm text-white/70"
          style={{ height: Math.min(pull, 56), opacity: Math.min(pull / PULL_THRESHOLD, 1) }}
          aria-hidden
        >
          <span className="pb-2">
            {pull >= PULL_THRESHOLD ? 'Soltá para actualizar' : 'Deslizá hacia abajo'}
          </span>
        </div>
      ) : null}
      <div
        className="relative w-full min-w-0 will-change-transform motion-reduce:transform-none"
        style={{
          transform: pull > 0 ? `translateY(${pull}px)` : undefined,
          transition: pull > 0 ? 'none' : 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
