"use client"

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'

const GalleryLightbox = dynamic(() => import('./GalleryLightbox'), { ssr: false })

const GALLERY_MAIN_SIZES =
  '(max-width:1023px) 100vw, (max-width:1279px) 54vw, (max-width:1919px) min(52vw, 960px), (max-width:2559px) min(50vw, 1200px), min(48vw, 1440px)'
const GALLERY_THUMB_SIZES =
  '(max-width:1023px) 50vw, (max-width:1279px) 22vw, (max-width:1919px) min(20vw, 420px), (max-width:2559px) min(18vw, 520px), min(17vw, 640px)'
const MOBILE_CAROUSEL_SIZES = '(max-width:1023px) 100vw, 100vw'
const GALLERY_MOBILE_QUERY = '(max-width: 1023px)'
const SWIPE_COMMIT_PX = 48
const TAP_MAX_PX = 12
const SLIDE_MS = 300
const SLIDE_EASE = 'cubic-bezier(0.33, 1, 0.32, 1)'
const AXIS_LOCK_PX = 8

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function useGalleryIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(GALLERY_MOBILE_QUERY).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(GALLERY_MOBILE_QUERY)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return isMobile
}

function usePreloadLightbox(enabled) {
  useEffect(() => {
    if (!enabled) return
    import('./GalleryLightbox')
  }, [enabled])
}

function useTransformCarousel(slideCount, onTapSlide, imagesKey) {
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

      if (totalMove <= TAP_MAX_PX && typeof onTapSlide === 'function') {
        onTapSlide(startIndex)
        return
      }

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
  }, [goToIndex, onTapSlide, slideCount])

  const trackStyle = {
    transform: `translate3d(-${activeIndex * 100}%, 0, 0)`,
    transition: isAnimating ? `transform ${SLIDE_MS}ms ${SLIDE_EASE}` : 'none',
  }

  return {
    viewportRef,
    activeIndex,
    goToIndex,
    trackStyle,
  }
}

function displayMain(url) {
  return imageService.forDisplay(url, 'galleryMain') || url
}
function displayThumb(url) {
  return imageService.forDisplay(url, 'galleryThumb') || url
}

export default function ProductGalleryModern({ image_url, images = [], altBase = '' }) {
  const isMobileGallery = useGalleryIsMobile()
  usePreloadLightbox(!isMobileGallery)

  const allImages = useMemo(() => {
    const main = imageService.resolve(image_url)
    const fromArray = (Array.isArray(images) ? images : image_url ? [image_url] : [])
      .map((src) => imageService.resolve(src))
      .filter(Boolean)
    const rest = fromArray.filter((url) => url !== main)
    const list = main ? [main, ...rest] : fromArray
    return list
  }, [image_url, images])

  const galleryImagesKey = allImages.join('|')

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = useCallback((index) => {
    if (isMobileGallery) return
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [isMobileGallery])

  useEffect(() => {
    if (isMobileGallery && lightboxOpen) setLightboxOpen(false)
  }, [isMobileGallery, lightboxOpen])

  const {
    viewportRef,
    activeIndex,
    goToIndex,
    trackStyle,
  } = useTransformCarousel(allImages.length, null, galleryImagesKey)

  const mainImage = allImages[0] || null
  const sideImages = allImages.slice(1)

  if (!mainImage) {
    return (
      <div className="w-full aspect-[4/3] bg-[var(--dark-surface-2)] rounded-2xl flex items-center justify-center">
        <span className="text-4xl opacity-30" aria-hidden>🎸</span>
      </div>
    )
  }

  return (
    <>
      {/* Móvil: slide horizontal con transform (sin scroll-snap) */}
      <div className="w-full space-y-2.5 lg:hidden">
        {allImages.length === 1 ? (
          <div
            className="relative mx-auto aspect-[4/5] w-full max-w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-[1.125rem] bg-[var(--dark-bg-card)]"
          >
            <ImageWithSkeleton
              src={displayMain(mainImage)}
              alt={altBase || 'Imagen del producto'}
              fill
              imgClassName="object-contain object-center p-1"
              imgStyle={{ transform: 'none', WebkitBackfaceVisibility: 'visible' }}
              sizes={MOBILE_CAROUSEL_SIZES}
              quality={74}
              priority={isMobileGallery}
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
            <div
              className="product-gallery-mobile-carousel__track flex w-full"
              style={trackStyle}
            >
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
                      priority={isMobileGallery && Math.abs(i - activeIndex) <= 1}
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

      {/* Desktop (lg+): layout asimétrico existente */}
      <div className="hidden w-full min-h-[400px] sm:min-h-[420px] lg:grid lg:min-h-[640px] lg:grid-cols-[1.18fr_0.82fr] min-[1920px]:lg:min-h-[800px] min-[2560px]:lg:min-h-[960px] gap-2 sm:gap-3 md:gap-4 lg:gap-5">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="no-custom-btn group relative w-full aspect-[4/5] lg:aspect-auto lg:min-h-[640px] min-[1920px]:lg:min-h-[800px] min-[2560px]:lg:min-h-[960px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)]"
          aria-label="Ver imagen principal"
        >
          <ImageWithSkeleton
            src={displayMain(mainImage)}
            alt={altBase || 'Imagen del producto'}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes={GALLERY_MAIN_SIZES}
            quality={74}
            priority={!isMobileGallery}
            disableClientPreview
          />
        </button>

        {sideImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 grid-rows-[1fr_1fr_1fr_1fr] min-h-[400px] sm:min-h-[420px] lg:min-h-[640px] min-[1920px]:lg:min-h-[800px] min-[2560px]:lg:min-h-[960px]">
            <button
              type="button"
              onClick={() => openLightbox(1)}
              className="no-custom-btn group relative row-span-2 min-h-[170px] sm:min-h-[240px] lg:min-h-[280px] min-[1920px]:min-h-[320px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]"
              aria-label="Ver imagen 2"
            >
              <ImageWithSkeleton
                src={displayThumb(sideImages[0])}
                alt={altBase ? `${altBase} — imagen 2` : 'Imagen 2'}
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                sizes={GALLERY_THUMB_SIZES}
                quality={62}
                disableClientPreview
              />
            </button>
            {sideImages[1] && (
              <button
                type="button"
                onClick={() => openLightbox(2)}
                className="no-custom-btn group relative min-h-[120px] sm:min-h-[160px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]"
                aria-label="Ver imagen 3"
              >
                <ImageWithSkeleton
                  src={displayThumb(sideImages[1])}
                  alt={altBase ? `${altBase} — imagen 3` : 'Imagen 3'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes={GALLERY_THUMB_SIZES}
                  quality={62}
                  disableClientPreview
                />
              </button>
            )}
            {sideImages[2] && (
              <button
                type="button"
                onClick={() => openLightbox(3)}
                className="no-custom-btn group relative min-h-[120px] sm:min-h-[160px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]"
                aria-label="Ver imagen 4"
              >
                <ImageWithSkeleton
                  src={displayThumb(sideImages[2])}
                  alt={altBase ? `${altBase} — imagen 4` : 'Imagen 4'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes={GALLERY_THUMB_SIZES}
                  quality={62}
                  disableClientPreview
                />
              </button>
            )}
            {sideImages[3] && (
              <button
                type="button"
                onClick={() => openLightbox(4)}
                className="no-custom-btn group relative min-h-[90px] sm:min-h-[120px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]"
                aria-label="Ver imagen 5"
              >
                <ImageWithSkeleton
                  src={displayThumb(sideImages[3])}
                  alt={altBase ? `${altBase} — imagen 5` : 'Imagen 5'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes={GALLERY_THUMB_SIZES}
                  quality={62}
                  disableClientPreview
                />
              </button>
            )}
            {sideImages[4] && (
              <button
                type="button"
                onClick={() => openLightbox(5)}
                className="no-custom-btn group relative row-span-2 min-h-[140px] sm:min-h-[180px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]"
                aria-label="Ver imagen 6"
              >
                <ImageWithSkeleton
                  src={displayThumb(sideImages[4])}
                  alt={altBase ? `${altBase} — imagen 6` : 'Imagen 6'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes={GALLERY_THUMB_SIZES}
                  quality={62}
                  disableClientPreview
                />
              </button>
            )}
            {sideImages[5] && (
              <button
                type="button"
                onClick={() => openLightbox(6)}
                className="no-custom-btn group relative min-h-[90px] sm:min-h-[120px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]"
                aria-label="Ver imagen 7"
              >
                <ImageWithSkeleton
                  src={displayThumb(sideImages[5])}
                  alt={altBase ? `${altBase} — imagen 7` : 'Imagen 7'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes={GALLERY_THUMB_SIZES}
                  quality={62}
                  disableClientPreview
                />
              </button>
            )}
          </div>
        )}
      </div>

      {lightboxOpen && !isMobileGallery && allImages.length > 0 && (
        <GalleryLightbox
          images={allImages.map((url) => imageService.forDisplay(url, 'lightbox') || url)}
          altBase={altBase}
          currentIndex={lightboxIndex}
          total={allImages.length}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length)}
          onNext={() => setLightboxIndex((i) => (i + 1) % allImages.length)}
        />
      )}
    </>
  )
}
