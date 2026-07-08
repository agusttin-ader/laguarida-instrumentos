"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

const SWIPE_COMMIT_PX = 48
const AXIS_LOCK_PX = 8
const SLIDE_MS = 300
const SLIDE_EASE = 'cubic-bezier(0.33, 1, 0.32, 1)'

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function GalleryLightbox({
  images = [],
  altBase = '',
  currentIndex = 0,
  total = 0,
  onClose = () => {},
  onPrev = () => {},
  onNext = () => {}
}) {
  const viewportRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideWidth, setSlideWidth] = useState(0)
  const prevIndexRef = useRef(currentIndex)
  const animTimerRef = useRef(0)
  const skipNextAnimationRef = useRef(true)
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    moved: 0,
    axis: null,
  })

  const slideCount = total || images.length
  const safeAlt = String(altBase || '').trim()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    document.body.classList.add('modal-open')
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    if (skipNextAnimationRef.current) {
      skipNextAnimationRef.current = false
      prevIndexRef.current = currentIndex
      return
    }
    if (prevIndexRef.current === currentIndex) return
    prevIndexRef.current = currentIndex
    window.clearTimeout(animTimerRef.current)
    setIsAnimating(true)
    animTimerRef.current = window.setTimeout(() => setIsAnimating(false), SLIDE_MS)
  }, [currentIndex])

  useEffect(() => () => window.clearTimeout(animTimerRef.current), [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return undefined

    const measure = () => {
      const w = el.clientWidth || 0
      if (w > 0) setSlideWidth(w)
    }

    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(el)
    window.addEventListener('resize', measure)

    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [mounted, slideCount])

  useEffect(() => {
    const el = viewportRef.current
    if (!el || slideCount < 2) return undefined

    const onTouchStart = (event) => {
      window.clearTimeout(animTimerRef.current)
      setIsAnimating(false)
      const touch = event.touches[0]
      gestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        moved: 0,
        axis: null,
      }
    }

    const onTouchMove = (event) => {
      const touch = event.touches[0]
      const { startX, startY } = gestureRef.current
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (!gestureRef.current.axis && (Math.abs(dx) > AXIS_LOCK_PX || Math.abs(dy) > AXIS_LOCK_PX)) {
        gestureRef.current.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
      }

      if (gestureRef.current.axis === 'x') {
        gestureRef.current.moved = Math.max(gestureRef.current.moved, Math.abs(dx))
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const onTouchEnd = (event) => {
      const { startX, moved, axis } = gestureRef.current
      const touch = event.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      const totalMove = Math.max(Math.abs(dx), Math.abs(dy), moved)

      gestureRef.current.axis = null

      if (totalMove <= AXIS_LOCK_PX) return
      if (axis !== 'x' || Math.abs(dx) < SWIPE_COMMIT_PX) return

      if (dx < 0) onNext()
      else onPrev()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [onNext, onPrev, slideCount])

  if (!mounted || typeof document === 'undefined') return null

  const closeBtnClass =
    'no-custom-btn z-[220] flex items-center justify-center rounded-full border border-white/25 bg-black/75 text-white shadow-[0_4px_20px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-transform active:scale-95'

  const trackStyle = {
    transform: `translate3d(-${currentIndex * slideWidth}px, 0, 0)`,
    transition: isAnimating ? `transform ${SLIDE_MS}ms ${SLIDE_EASE}` : 'none',
  }

  return createPortal(
    <div
      className="gallery-lightbox fixed inset-0 z-[200] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Vista de imagen ampliada"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="no-custom-btn absolute inset-0 z-0 cursor-default border-0 bg-transparent"
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center p-2 sm:p-4">
        {slideCount > 1 ? (
          <div
            ref={viewportRef}
            className="gallery-lightbox__viewport relative h-full w-full max-h-full max-w-full overflow-hidden touch-pan-x select-none"
          >
            <div className="gallery-lightbox__track flex h-full w-full" style={trackStyle}>
              {images.map((imageSrc, i) => (
                <div
                  key={`${imageSrc}-${i}`}
                  className="gallery-lightbox__slide relative h-full w-full shrink-0 basis-full"
                  aria-hidden={i !== currentIndex}
                >
                  <Image
                    src={imageSrc}
                    alt={safeAlt ? `${safeAlt} — imagen ${i + 1}` : `Imagen ${i + 1}`}
                    fill
                    sizes="100vw"
                    qualityPreset="lightbox"
                    loading={Math.abs(i - currentIndex) <= 1 ? 'eager' : 'lazy'}
                    draggable={false}
                    className="object-contain pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full max-h-full max-w-full">
            <Image
              src={images[0]}
              alt={safeAlt || 'Imagen ampliada'}
              fill
              sizes="100vw"
              qualityPreset="lightbox"
              loading="eager"
              draggable={false}
              className="object-contain"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label="Cerrar"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className={`${closeBtnClass} absolute right-3 size-12 sm:right-4 sm:size-12`}
        style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
      >
        <CloseIcon />
      </button>

      {slideCount > 1 && (
        <button
          type="button"
          aria-label="Imagen anterior"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-3 sm:left-6 top-1/2 z-[210] flex -translate-y-1/2 items-center justify-center p-2 text-white opacity-90 no-custom-btn transition-[opacity,transform] duration-200 hover:scale-125 hover:opacity-100 active:scale-95 [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.6))]"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sm:h-10 sm:w-10">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {slideCount > 1 && (
        <button
          type="button"
          aria-label="Siguiente imagen"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-3 sm:right-6 top-1/2 z-[210] flex -translate-y-1/2 items-center justify-center p-2 text-white opacity-90 no-custom-btn transition-[opacity,transform] duration-200 hover:scale-125 hover:opacity-100 active:scale-95 [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.6))]"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sm:h-10 sm:w-10">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 z-[210] flex flex-col items-center gap-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-6 pt-14 sm:pb-8"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {safeAlt && (
          <p className="max-w-xl px-2 text-center text-xs text-white/95 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-sm">
            {safeAlt}
          </p>
        )}

        {slideCount > 1 && (
          <span className="text-xs tabular-nums text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {currentIndex + 1} / {slideCount}
          </span>
        )}
      </div>
    </div>,
    document.body
  )
}
