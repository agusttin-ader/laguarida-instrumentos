"use client"

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'
import { animateScrollLeft, createScrollAnimator } from '../lib/smoothHorizontalScroll'

const GalleryLightbox = dynamic(() => import('./GalleryLightbox'), { ssr: false })

const GALLERY_MAIN_SIZES =
  '(max-width:1023px) 100vw, (max-width:1279px) 54vw, (max-width:1919px) min(52vw, 960px), (max-width:2559px) min(50vw, 1200px), min(48vw, 1440px)'
const GALLERY_THUMB_SIZES =
  '(max-width:1023px) 50vw, (max-width:1279px) 22vw, (max-width:1919px) min(20vw, 420px), (max-width:2559px) min(18vw, 520px), min(17vw, 640px)'
const MOBILE_CAROUSEL_SIZES = '(max-width:1023px) 100vw, 100vw'
const GALLERY_MOBILE_QUERY = '(max-width: 1023px)'
const SWIPE_HINT_DELAY_MS = 900
const SWIPE_HINT_PEEK_RATIO = 0.14
const SWIPE_HINT_MAX_PX = 52
const SWIPE_COMMIT_RATIO = 0.22
const TAP_MAX_PX = 12

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function getSlideWidth(el) {
  return el.clientWidth || el.children[0]?.getBoundingClientRect().width || 0
}

function scrollToIndex(el, index, slideCount, instant = false) {
  const slideW = getSlideWidth(el)
  if (!slideW) return 0
  const clamped = Math.max(0, Math.min(slideCount - 1, index))
  const left = clamped * slideW
  if (instant) {
    el.scrollLeft = left
  }
  return { left, index: clamped }
}

function useMobileSwipeHint({ enabled, carouselRef, slideCount, imagesKey }) {
  const ranRef = useRef(false)

  useEffect(() => {
    ranRef.current = false
  }, [imagesKey])

  useEffect(() => {
    if (!enabled || slideCount < 2 || ranRef.current) return undefined
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const el = carouselRef.current
    if (!el) return undefined

    let cancelled = false
    let timeoutId = 0

    const cancel = () => {
      if (cancelled) return
      cancelled = true
      window.clearTimeout(timeoutId)
    }

    el.addEventListener('touchstart', cancel, { passive: true })
    el.addEventListener('pointerdown', cancel, { passive: true })

    timeoutId = window.setTimeout(async () => {
      if (cancelled || ranRef.current) return
      const slideW = getSlideWidth(el)
      if (slideW <= 0) return

      ranRef.current = true
      const peek = Math.min(slideW * SWIPE_HINT_PEEK_RATIO, SWIPE_HINT_MAX_PX)

      try {
        await animateScrollLeft(el, peek, { durationMs: 420 })
        if (cancelled) {
          el.scrollLeft = 0
          return
        }
        await delay(140)
        if (cancelled) {
          el.scrollLeft = 0
          return
        }
        await animateScrollLeft(el, 0, { durationMs: 520 })
      } catch {
        el.scrollLeft = 0
      }
    }, SWIPE_HINT_DELAY_MS)

    return () => {
      cancel()
      el.removeEventListener('touchstart', cancel)
      el.removeEventListener('pointerdown', cancel)
    }
  }, [enabled, slideCount, imagesKey, carouselRef])
}

function useControlledMobileCarousel(carouselRef, slideCount, setActiveIndex, onTapSlide) {
  const gestureRef = useRef({
    tracking: false,
    startX: 0,
    startScroll: 0,
    startIndex: 0,
    moved: 0,
  })
  const animatorRef = useRef(createScrollAnimator())

  useEffect(() => {
    const el = carouselRef.current
    if (!el || slideCount < 2) return undefined

    const animator = animatorRef.current
    const maxScroll = () => Math.max(0, (slideCount - 1) * getSlideWidth(el))

    const snapTo = (index, instant = false) => {
      const { left, index: snapped } = scrollToIndex(el, index, slideCount, instant)
      setActiveIndex(snapped)
      return animator.run(el, left, { instant, durationMs: 360 })
    }

    const onTouchStart = (event) => {
      animator.cancel()
      const touch = event.touches[0]
      const slideW = getSlideWidth(el)
      gestureRef.current = {
        tracking: true,
        startX: touch.clientX,
        startScroll: el.scrollLeft,
        startIndex: slideW ? Math.round(el.scrollLeft / slideW) : 0,
        moved: 0,
      }
    }

    const onTouchMove = (event) => {
      if (!gestureRef.current.tracking) return
      const touch = event.touches[0]
      const delta = gestureRef.current.startX - touch.clientX
      gestureRef.current.moved = Math.max(gestureRef.current.moved, Math.abs(delta))

      const slideW = getSlideWidth(el)
      if (!slideW) return

      let nextScroll = gestureRef.current.startScroll + delta
      const startIdx = gestureRef.current.startIndex
      const minScroll = Math.max(0, (startIdx - 1) * slideW)
      const maxAllowed = Math.min(maxScroll(), (startIdx + 1) * slideW)
      nextScroll = Math.max(minScroll, Math.min(maxAllowed, nextScroll))
      el.scrollLeft = nextScroll

      if (Math.abs(delta) > 8) {
        event.preventDefault()
      }
    }

    const onTouchEnd = (event) => {
      if (!gestureRef.current.tracking) return
      gestureRef.current.tracking = false

      const { startX, startIndex, moved } = gestureRef.current
      const endX = event.changedTouches[0].clientX
      const delta = startX - endX
      const slideW = getSlideWidth(el)

      if (moved <= TAP_MAX_PX && typeof onTapSlide === 'function') {
        onTapSlide(startIndex)
        snapTo(startIndex)
        return
      }

      if (!slideW) {
        snapTo(startIndex)
        return
      }

      const offset = el.scrollLeft - startIndex * slideW
      let target = startIndex

      if (delta > slideW * SWIPE_COMMIT_RATIO || offset > slideW * SWIPE_COMMIT_RATIO) {
        target = startIndex + 1
      } else if (delta < -slideW * SWIPE_COMMIT_RATIO || offset < -slideW * SWIPE_COMMIT_RATIO) {
        target = startIndex - 1
      }

      target = Math.max(startIndex - 1, Math.min(startIndex + 1, target))
      snapTo(target)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      animator.cancel()
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [carouselRef, slideCount, setActiveIndex, onTapSlide])
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

function usePreloadLightbox() {
  useEffect(() => {
    import('./GalleryLightbox')
  }, [])
}

function displayMain(url) {
  return imageService.forDisplay(url, 'galleryMain') || url
}
function displayThumb(url) {
  return imageService.forDisplay(url, 'galleryThumb') || url
}

export default function ProductGalleryModern({ image_url, images = [], altBase = '' }) {
  usePreloadLightbox()
  const isMobileGallery = useGalleryIsMobile()
  const carouselRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

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

  useEffect(() => {
    setActiveIndex(0)
    const el = carouselRef.current
    if (el) el.scrollLeft = 0
  }, [galleryImagesKey])

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  useMobileSwipeHint({
    enabled: isMobileGallery,
    carouselRef,
    slideCount: allImages.length,
    imagesKey: galleryImagesKey,
  })

  useControlledMobileCarousel(carouselRef, allImages.length, setActiveIndex, openLightbox)

  const goToSlide = useCallback((index) => {
    const el = carouselRef.current
    if (!el) return
    const { left, index: snapped } = scrollToIndex(el, index, allImages.length)
    setActiveIndex(snapped)
    animateScrollLeft(el, left, { durationMs: 360 })
  }, [allImages.length])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return undefined
    const onResize = () => {
      const { left, index: snapped } = scrollToIndex(el, activeIndex, allImages.length, true)
      el.scrollLeft = left
      setActiveIndex(snapped)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeIndex, allImages.length])

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
      {/* Móvil: desliz horizontal, una foto por gesto */}
      <div className="w-full space-y-2.5 lg:hidden">
        {allImages.length === 1 ? (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="no-custom-btn group relative mx-auto block aspect-[4/5] w-full max-w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-[1.125rem] bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)]"
            aria-label={altBase ? `${altBase} — ampliar foto` : 'Ampliar foto'}
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
          </button>
        ) : (
        <div
          ref={carouselRef}
          role="region"
          aria-roledescription="Carrusel"
          aria-label="Fotos del producto. Deslizá para ver más."
          className="product-gallery-mobile-carousel flex w-full touch-pan-y overflow-x-auto overscroll-x-contain snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {allImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="product-gallery-mobile-carousel__slide flex w-full shrink-0 basis-full snap-start snap-always justify-center px-0"
            >
              <div
                className="group relative aspect-[4/5] w-full max-w-[min(28rem,calc(100vw-2rem))] shrink-0 overflow-hidden rounded-[1.125rem] bg-[var(--dark-bg-card)]"
                aria-hidden
              >
                <ImageWithSkeleton
                  src={i === 0 ? displayMain(src) : displayThumb(src)}
                  alt={altBase ? `${altBase} — imagen ${i + 1}` : `Imagen ${i + 1}`}
                  fill
                  imgClassName="object-contain object-center p-1 transition-opacity duration-300 ease-out"
                  imgStyle={{ transform: 'none', WebkitBackfaceVisibility: 'visible' }}
                  sizes={MOBILE_CAROUSEL_SIZES}
                  quality={i === 0 ? 74 : 62}
                  priority={isMobileGallery && i === 0}
                  disableClientPreview
                />
              </div>
            </div>
          ))}
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
                  onClick={() => goToSlide(i)}
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

      {lightboxOpen && allImages.length > 0 && (
        <GalleryLightbox
          src={imageService.forDisplay(allImages[lightboxIndex], 'lightbox') || allImages[lightboxIndex]}
          alt={altBase ? `${altBase} — imagen ${lightboxIndex + 1}` : `Imagen ${lightboxIndex + 1}`}
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
