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
  const [snapIndex, setSnapIndex] = useState(0)

  const allImages = useMemo(() => {
    const main = imageService.resolve(image_url)
    const fromArray = (Array.isArray(images) ? images : image_url ? [image_url] : [])
      .map((src) => imageService.resolve(src))
      .filter(Boolean)
    const rest = fromArray.filter((url) => url !== main)
    const list = main ? [main, ...rest] : fromArray
    return list
  }, [image_url, images])

  const updateSnapIndex = useCallback(() => {
    const el = carouselRef.current
    if (!el || !allImages.length) return
    const first = el.children[0]
    if (!first) return
    const gap = 0
    const slideW = first.getBoundingClientRect().width + gap
    if (slideW <= gap) return
    const idx = Math.round(el.scrollLeft / slideW)
    setSnapIndex(Math.min(Math.max(0, idx), allImages.length - 1))
  }, [allImages.length])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const handler = () => updateSnapIndex()
    el.addEventListener('scroll', handler, { passive: true })
    el.addEventListener('scrollend', handler)
    window.addEventListener('resize', handler)
    return () => {
      el.removeEventListener('scroll', handler)
      el.removeEventListener('scrollend', handler)
      window.removeEventListener('resize', handler)
    }
  }, [updateSnapIndex])

  const scrollToSlide = useCallback((i) => {
    const el = carouselRef.current
    if (!el || !el.children[i]) return
    el.children[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }, [])

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const mainImage = allImages[0] || null
  const sideImages = allImages.slice(1)

  function openLightbox(index) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (!mainImage) {
    return (
      <div className="w-full aspect-[4/3] bg-[var(--dark-surface-2)] rounded-2xl flex items-center justify-center">
        <span className="text-4xl opacity-30" aria-hidden>🎸</span>
      </div>
    )
  }

  return (
    <>
      {/* Móvil: carrusel horizontal con snap (debajo de lg). Cada slide ocupa el ancho del carrusel; la tarjeta va centrada dentro. */}
      <div className="w-full space-y-2 lg:hidden">
        <div
          ref={carouselRef}
          role="region"
          aria-roledescription="Carrusel"
          aria-label="Fotos del producto. Deslizá para ver más."
          className="flex w-full touch-auto overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {allImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="flex min-h-0 min-w-full shrink-0 snap-center justify-center px-0.5"
            >
              <button
                type="button"
                onClick={() => openLightbox(i)}
                className="no-custom-btn group relative aspect-[4/5] w-full max-w-[min(26rem,calc(100vw-1.25rem))] shrink-0 overflow-hidden rounded-xl bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)]"
                aria-label={altBase ? `${altBase} — foto ${i + 1} de ${allImages.length}` : `Foto ${i + 1} de ${allImages.length}`}
              >
                <ImageWithSkeleton
                  src={i === 0 ? displayMain(src) : displayThumb(src)}
                  alt={altBase ? `${altBase} — imagen ${i + 1}` : `Imagen ${i + 1}`}
                  fill
                  imgClassName="object-cover object-center transition-transform duration-300 ease-out group-active:scale-[1.02]"
                  sizes={MOBILE_CAROUSEL_SIZES}
                  quality={i === 0 ? 74 : 62}
                  priority={isMobileGallery && i === 0}
                  disableClientPreview
                />
              </button>
            </div>
          ))}
        </div>
        {allImages.length > 1 ? (
          <div className="flex items-center justify-center gap-3 px-0.5">
            <span className="sr-only">
              Foto {snapIndex + 1} de {allImages.length}
            </span>
            <div className="flex items-center gap-1.5" role="group" aria-label="Ir a una foto">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-current={i === snapIndex ? 'true' : undefined}
                  aria-label={`Foto ${i + 1}`}
                  onClick={() => scrollToSlide(i)}
                  className={`no-custom-btn h-2 rounded-full transition-[width,background-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)] ${
                    i === snapIndex
                      ? 'w-6 bg-[var(--vintage-gold)]'
                      : 'w-2 bg-white/25 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] tabular-nums text-[var(--dark-muted)]" aria-hidden>
              {snapIndex + 1}/{allImages.length}
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
