"use client"

import React from 'react'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'
import { useNativeScrollCarousel } from '../hooks/useNativeScrollCarousel'

const MOBILE_CAROUSEL_SIZES = '(max-width:1023px) 100vw, 100vw'

function displayMain(url) {
  return imageService.forDisplay(url, 'galleryMain') || url
}

function displayThumb(url) {
  return imageService.forDisplay(url, 'galleryThumb') || url
}

/** Galería de producto solo para móvil (< lg). Sin lightbox. */
export default function ProductGalleryMobile({ allImages, altBase = '', imagesKey }) {
  const mainImage = allImages[0]
  const { scrollerRef, activeIndex, goToIndex } = useNativeScrollCarousel(
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
          ref={scrollerRef}
          role="region"
          aria-roledescription="Carrusel"
          aria-label="Fotos del producto. Deslizá horizontalmente para ver más."
          className="native-mobile-carousel product-gallery-mobile-carousel mx-auto flex w-full max-w-[min(28rem,calc(100vw-2rem))] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {allImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="native-mobile-carousel__slide product-gallery-mobile-carousel__slide w-full shrink-0 snap-start snap-always"
              aria-hidden={i !== activeIndex}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.125rem] bg-[var(--dark-bg-card)]">
                <ImageWithSkeleton
                  src={i === 0 ? displayMain(src) : displayThumb(src)}
                  alt={altBase ? `${altBase} — imagen ${i + 1}` : `Imagen ${i + 1}`}
                  fill
                  imgClassName="object-contain object-center p-1"
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
