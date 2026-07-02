"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'

const MOBILE_CAROUSEL_SIZES = '(max-width:1023px) 100vw, 100vw'
const SWIPE_COMMIT_PX = 48
const TAP_MAX_PX = 12
const SLIDE_MS = 300
const SLIDE_EASE = 'cubic-bezier(0.33, 1, 0.32, 1)'
const AXIS_LOCK_PX = 8

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function displayMain(url) {
  return imageService.forDisplay(url, 'galleryMain') || url
}

function displayThumb(url) {
  return imageService.forDisplay(url, 'galleryThumb') || url
}

function useMobileCarousel(slideCount, imagesKey) {
  const viewportRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const activeIndexRef = useRef(0)
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    startIndex: 0,
    moved: 0,
    axis: null,
  })
  const animTimerRef = useRef(0)

  const goToIndex = useCallback((index) => {
    const next = clamp(index, 0, Math.max(0, slideCount - 1))
    window.clearTimeout(animTimerRef.current)
    activeIndexRef.current = next
    setActiveIndex(next)
    setIsAnimating(true)
    animTimerRef.current = window.setTimeout(() => setIsAnimating(false), SLIDE_MS)
  }, [slideCount])

  useEffect(() => {
    activeIndexRef.current = 0
    setActiveIndex(0)
    setIsAnimating(false)
    gestureRef.current.axis = null
  }, [slideCount, imagesKey])

  useEffect(() => () => window.clearTimeout(animTimerRef.current), [])

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
        startIndex: activeIndexRef.current,
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
      const { startX, startIndex, moved, axis } = gestureRef.current
      const touch = event.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      const totalMove = Math.max(Math.abs(dx), Math.abs(dy), moved)

      gestureRef.current.axis = null

      if (totalMove <= TAP_MAX_PX) return

      if (axis !== 'x' || Math.abs(dx) < SWIPE_COMMIT_PX) return

      if (dx < 0 && startIndex < slideCount - 1) {
        goToIndex(startIndex + 1)
      } else if (dx > 0 && startIndex > 0) {
        goToIndex(startIndex - 1)
      }
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
  }, [goToIndex, slideCount])

  const trackStyle = {
    transform: `translate3d(-${activeIndex * 100}%, 0, 0)`,
    transition: isAnimating ? `transform ${SLIDE_MS}ms ${SLIDE_EASE}` : 'none',
  }

  return { viewportRef, activeIndex, goToIndex, trackStyle }
}

/** Galería de producto solo para móvil (< lg). Sin lightbox. */
export default function ProductGalleryMobile({ allImages, altBase = '', imagesKey }) {
  const mainImage = allImages[0]
  const { viewportRef, activeIndex, goToIndex, trackStyle } = useMobileCarousel(
    allImages.length,
    imagesKey
  )

  if (!mainImage) return null

  return (
    <div className="w-full space-y-2.5 lg:hidden">
      {allImages.length === 1 ? (
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-[1.125rem] bg-[var(--dark-bg-card)]">
          <ImageWithSkeleton
            src={displayMain(mainImage)}
            alt={altBase || 'Imagen del producto'}
            fill
            imgClassName="object-contain object-center p-1"
            imgStyle={{ transform: 'none', WebkitBackfaceVisibility: 'visible' }}
            sizes={MOBILE_CAROUSEL_SIZES}
            quality={74}
            priority
            disableClientPreview
          />
        </div>
      ) : (
        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="Carrusel"
          aria-label="Fotos del producto. Deslizá horizontalmente para ver más."
          className="product-gallery-mobile-carousel mx-auto w-full max-w-[min(28rem,calc(100vw-2rem))] touch-pan-x select-none"
        >
          <div className="product-gallery-mobile-carousel__track flex w-full" style={trackStyle}>
            {allImages.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="product-gallery-mobile-carousel__slide w-full shrink-0 basis-full"
                aria-hidden={i !== activeIndex}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[1.125rem] bg-[var(--dark-bg-card)]">
                  <ImageWithSkeleton
                    src={i === 0 ? displayMain(src) : displayThumb(src)}
                    alt={altBase ? `${altBase} — imagen ${i + 1}` : `Imagen ${i + 1}`}
                    fill
                    imgClassName="object-contain object-center p-1 !opacity-100 transition-none motion-reduce:transition-none"
                    imgStyle={{ transform: 'none', WebkitBackfaceVisibility: 'visible' }}
                    sizes={MOBILE_CAROUSEL_SIZES}
                    quality={i === 0 ? 74 : 62}
                    priority={Math.abs(i - activeIndex) <= 1}
                    disableClientPreview
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allImages.length > 1 ? (
        <div className="flex items-center justify-center gap-3 px-0.5">
          <span className="sr-only">
            Foto {activeIndex + 1} de {allImages.length}
          </span>
          <div className="flex items-center gap-1.5" role="group" aria-label="Ir a una foto">
            {allImages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-current={i === activeIndex ? 'true' : undefined}
                aria-label={`Foto ${i + 1}`}
                onClick={() => goToIndex(i)}
                className="no-custom-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)]"
              >
                <span
                  aria-hidden
                  className={`block h-2 rounded-full transition-[width,background-color] duration-200 ${
                    i === activeIndex
                      ? 'w-6 bg-[var(--vintage-gold)]'
                      : 'w-2 bg-white/25'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] tabular-nums text-[var(--dark-muted)]" aria-hidden>
            {activeIndex + 1}/{allImages.length}
          </span>
        </div>
      ) : null}
    </div>
  )
}
