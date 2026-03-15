"use client"

import React, { useMemo, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'

const GalleryLightbox = dynamic(() => import('./GalleryLightbox'), { ssr: false })

// Preload lightbox chunk after gallery is visible so first open is instant
function usePreloadLightbox() {
  useEffect(() => {
    import('./GalleryLightbox')
  }, [])
}

export default function ProductGalleryModern({ image_url, images = [], altBase = '' }) {
  usePreloadLightbox()
  const allImages = useMemo(() => {
    const main = imageService.resolve(image_url)
    const fromArray = (Array.isArray(images) ? images : image_url ? [image_url] : [])
      .map((src) => imageService.resolve(src))
      .filter(Boolean)
    const rest = fromArray.filter((url) => url !== main)
    const list = main ? [main, ...rest] : fromArray
    return list
  }, [image_url, images])

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const mainImage = allImages[0] || null
  const sideImages = allImages.slice(1) // columna derecha: arriba 1 alta + 2 chicas; abajo 1 vertical (unida) + 2 chicas

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
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-2 sm:gap-3 md:gap-4 min-h-[380px] lg:min-h-[580px]">
        {/* Imagen principal: grande a la izquierda */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="no-custom-btn group relative w-full aspect-[4/5] lg:aspect-auto lg:min-h-[580px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)]"
          aria-label="Ver imagen principal"
        >
          <ImageWithSkeleton
            src={mainImage}
            alt={altBase || 'Imagen del producto'}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="(min-width:1024px) 52vw, 100vw"
            quality={100}
            priority
            disableClientPreview
          />
        </button>

        {/* Columna derecha: grid asimétrico + 2 filas abajo para igualar altura con la principal */}
        {sideImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 grid-rows-[1fr_1fr_1fr_1fr] min-h-[380px] lg:min-h-[580px]">
            {/* Arriba: imagen alta (span 2 rows) + dos chicas — simétrico */}
            <button
              type="button"
              onClick={() => openLightbox(1)}
              className="no-custom-btn group relative row-span-2 min-h-[160px] sm:min-h-[220px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]"
              aria-label="Ver imagen 2"
            >
              <ImageWithSkeleton
                src={sideImages[0]}
                alt={altBase ? `${altBase} — imagen 2` : 'Imagen 2'}
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                sizes="(min-width:1024px) 20vw, 50vw"
                quality={100}
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
                  src={sideImages[1]}
                  alt={altBase ? `${altBase} — imagen 3` : 'Imagen 3'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(min-width:1024px) 20vw, 50vw"
                  quality={100}
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
                  src={sideImages[2]}
                  alt={altBase ? `${altBase} — imagen 4` : 'Imagen 4'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(min-width:1024px) 20vw, 50vw"
                  quality={100}
                  disableClientPreview
                />
              </button>
            )}
            {/* Abajo: dos chicas a la izquierda + contenedor vertical a la derecha */}
            {sideImages[3] && (
              <button
                type="button"
                onClick={() => openLightbox(4)}
                className="no-custom-btn group relative min-h-[90px] sm:min-h-[120px] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--dark-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]"
                aria-label="Ver imagen 5"
              >
                <ImageWithSkeleton
                  src={sideImages[3]}
                  alt={altBase ? `${altBase} — imagen 5` : 'Imagen 5'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(min-width:1024px) 20vw, 50vw"
                  quality={100}
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
                  src={sideImages[4]}
                  alt={altBase ? `${altBase} — imagen 6` : 'Imagen 6'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(min-width:1024px) 20vw, 50vw"
                  quality={100}
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
                  src={sideImages[5]}
                  alt={altBase ? `${altBase} — imagen 7` : 'Imagen 7'}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(min-width:1024px) 20vw, 50vw"
                  quality={100}
                  disableClientPreview
                />
              </button>
            )}
          </div>
        )}
      </div>

      {lightboxOpen && allImages.length > 0 && (
        <GalleryLightbox
          src={allImages[lightboxIndex]}
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
