"use client"

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import ImageWithSkeleton from './ImageWithSkeleton'
import ProductGalleryMobile from './ProductGalleryMobile'
import imageService from '../lib/utils/imageService'

const GalleryLightbox = dynamic(() => import('./GalleryLightbox'), { ssr: false })

const GALLERY_MAIN_SIZES =
  '(max-width:1023px) 100vw, (max-width:1279px) 54vw, (max-width:1919px) min(52vw, 960px), (max-width:2559px) min(50vw, 1200px), min(48vw, 1440px)'
const GALLERY_THUMB_SIZES =
  '(max-width:1023px) 50vw, (max-width:1279px) 22vw, (max-width:1919px) min(20vw, 420px), (max-width:2559px) min(18vw, 520px), min(17vw, 640px)'
const DESKTOP_GALLERY_QUERY = '(min-width: 1024px)'

function displayMain(url) {
  return imageService.forDisplay(url, 'galleryMain') || url
}

function displayThumb(url) {
  return imageService.forDisplay(url, 'galleryThumb') || url
}

function usePreloadLightbox(enabled) {
  useEffect(() => {
    if (!enabled) return
    import('./GalleryLightbox')
  }, [enabled])
}

/**
 * Galería de ficha de producto.
 * - Móvil (< lg): carrusel con slide, sin lightbox → ProductGalleryMobile
 * - Desktop (lg+): grid asimétrico + lightbox al hacer clic
 */
export default function ProductGalleryModern({ image_url, images = [], altBase = '' }) {
  const [isDesktopGallery, setIsDesktopGallery] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(DESKTOP_GALLERY_QUERY).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_GALLERY_QUERY)
    const sync = () => setIsDesktopGallery(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  usePreloadLightbox(isDesktopGallery)

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
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  useEffect(() => {
    if (!isDesktopGallery && lightboxOpen) setLightboxOpen(false)
  }, [isDesktopGallery, lightboxOpen])

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
      <ProductGalleryMobile
        allImages={allImages}
        altBase={altBase}
        imagesKey={galleryImagesKey}
      />

      {/* Desktop (lg+): sin cambios de comportamiento — grid + lightbox */}
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
            qualityPreset="galleryMain"
            priority={isDesktopGallery}
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
                qualityPreset="galleryThumb"
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
                  qualityPreset="galleryThumb"
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
                  qualityPreset="galleryThumb"
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
                  qualityPreset="galleryThumb"
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
                  qualityPreset="galleryThumb"
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
                  qualityPreset="galleryThumb"
                  disableClientPreview
                />
              </button>
            )}
          </div>
        )}
      </div>

      {lightboxOpen && isDesktopGallery && allImages.length > 0 && (
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
