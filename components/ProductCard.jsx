"use client";

import React, { useState, useRef, useMemo } from 'react'
import Image from 'next/image'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import Link from 'next/link'

const CARD_IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
const SWIPE_THRESHOLD = 40

const ProductCard = React.memo(function ProductCard({ item, priority = false, imageFit = 'cover' }) {
  const p = normalizeProduct(item)
  const imageList = useMemo(() => {
    const main = imageService.resolve(p.image_url)
    const resolved = (Array.isArray(p.images) ? p.images : p.image_url ? [p.image_url] : [])
      .map((src) => imageService.resolve(src))
      .filter(Boolean)
    const rest = resolved.filter((url) => url !== main)
    const list = main ? [main, ...rest] : rest
    return list.slice(0, 5)
  }, [p.images, p.image_url])
  const img = imageList[0]
  const [errored, setErrored] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const galleryIndexRef = useRef(0)
  const touchStartX = useRef(0)
  const didSwipe = useRef(false)
  galleryIndexRef.current = galleryIndex
  const titleText = p.name || ''
  const headingId = `product-title-${p.slug || p.id}`
  const specs = []
  if (p.mics) specs.push(String(p.mics).trim())
  if (p.wood) specs.push(String(p.wood).trim())
  if (p.model) specs.push(String(p.model).trim())
  const visibleSpecs = specs.slice(0, 2)
  const hiddenSpecsCount = Math.max(0, specs.length - visibleSpecs.length)
  const objectFit = imageFit === 'contain' ? 'contain' : 'cover'
  const hasGallery = imageList.length > 1

  function handleGalleryTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    didSwipe.current = false
  }
  function handleGalleryTouchMove(e) {
    const dx = e.touches[0].clientX - touchStartX.current
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    didSwipe.current = true
    const current = galleryIndexRef.current
    const next = dx < 0 ? Math.min(current + 1, imageList.length - 1) : Math.max(current - 1, 0)
    if (next !== current) {
      galleryIndexRef.current = next
      setGalleryIndex(next)
      touchStartX.current = e.touches[0].clientX
    }
  }
  function handleGalleryClick(e) {
    if (didSwipe.current) {
      e.preventDefault()
      e.stopPropagation()
      didSwipe.current = false
    }
  }

  return (
    <article
      aria-labelledby={headingId}
      className="card-interactive w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-[var(--dark-border)] bg-[var(--dark-bg-card)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:rounded-[20px] md:shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
    >
      {/* Desktop: card entera es link */}
      <Link
        href={`/guitars/${p.slug || p.id}`}
        aria-label={`Ir a ${titleText || 'producto'}`}
        className="hidden md:block no-custom-btn card-product-link"
      >
        <div className="relative w-full overflow-hidden bg-[var(--dark-surface-2)] aspect-[5/4]">
          {img && !errored ? (
            <>
              <div className={`absolute inset-0 bg-[var(--dark-surface-2)] transition-opacity duration-300 ${imgLoaded ? 'opacity-0 pointer-events-none' : 'animate-pulse'}`} aria-hidden />
              <Image
                src={img}
                alt={titleText || 'Imagen del producto'}
                fill
                sizes={CARD_IMAGE_SIZES}
                quality={100}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'low'}
                onLoad={() => { setImgLoaded(true); setErrored(false) }}
                onError={() => setErrored(true)}
                className={`img-reveal ${imgLoaded ? 'img-loaded' : ''}`}
                style={{ objectFit: objectFit, objectPosition: 'center' }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--dark-surface-2)] animate-pulse">
              <span className="text-3xl opacity-40">🎸</span>
            </div>
          )}
          <div
            className="flex absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/20"
            style={{
              background: 'rgba(18,19,24,0.72)',
              WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              backdropFilter: 'blur(12px) saturate(120%)',
              zIndex: 20,
            }}
          >
            <div className="flex-1 min-w-0">
              <h3 id={headingId} className="text-base lg:text-lg font-semibold text-white leading-tight line-clamp-2">
                {titleText}
              </h3>
              {p.price && (
                <div className="text-sm font-semibold text-[var(--dark-text-secondary)] mt-1">{p.price}</div>
              )}
            </div>
            <div className="flex-shrink-0 ml-3">
              <span className="px-3 py-1.5 rounded-full bg-white/12 text-white text-xs font-medium border border-white/25">Ver detalles</span>
            </div>
          </div>
          {specs.length ? (
            <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {visibleSpecs.map((s, i) => (
                <div key={i} className="bg-black/70 text-[#f0f0f4] text-[11px] px-3 py-1 rounded-full border border-white/15">
                  {s}
                </div>
              ))}
              {hiddenSpecsCount > 0 ? (
                <div className="bg-black/60 text-white/85 text-[11px] px-2.5 py-1 rounded-full border border-white/15">
                  +{hiddenSpecsCount}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>

      {/* Mobile: variante Banff — texto + botón arriba, imagen con galería abajo */}
      <div className="md:hidden flex flex-col">
        <div className="px-4 pt-4 pb-4 bg-[var(--dark-bg-elevated)] border-b border-[var(--dark-border)] rounded-t-lg">
          <h3 id={headingId} className="text-[1.0625rem] font-bold text-white leading-snug line-clamp-2 break-words" aria-hidden>
            {titleText}
          </h3>
          {p.description ? (
            <p className="mt-1.5 text-[13px] text-white/70 leading-snug line-clamp-2">{p.description}</p>
          ) : null}
          <div className="mt-3 flex flex-row items-center justify-between gap-3">
            {p.price && <p className="text-[1rem] font-bold text-white">{p.price}</p>}
            <Link
              href={`/guitars/${p.slug || p.id}`}
              className="no-custom-btn shrink-0 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl btn-cta-dark font-semibold text-[13px]"
            >
              Ver producto
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
        <Link
          href={`/guitars/${p.slug || p.id}`}
          aria-label={`Ver ${titleText || 'producto'}`}
          className="block no-custom-btn"
        >
          <div
            className="relative w-full overflow-hidden bg-[var(--dark-surface-2)] aspect-[4/3] touch-pan-y rounded-b-lg"
            onTouchStart={hasGallery ? handleGalleryTouchStart : undefined}
            onTouchMove={hasGallery ? handleGalleryTouchMove : undefined}
            onClick={handleGalleryClick}
          >
            {imageList.length > 0 ? (
              <>
                {imageList.map((src, idx) => (
                  <div
                    key={idx}
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{ opacity: idx === galleryIndex ? 1 : 0, pointerEvents: idx === galleryIndex ? 'auto' : 'none', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                  >
                    <Image
                      src={src}
                      alt={idx === 0 ? (titleText || 'Imagen del producto') : `Imagen ${idx + 1} de ${titleText || 'producto'}`}
                      fill
                      sizes={CARD_IMAGE_SIZES}
                      quality={100}
                      loading={priority && idx === 0 ? 'eager' : 'lazy'}
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center animate-pulse">
                <span className="text-3xl opacity-40">🎸</span>
              </div>
            )}
            {hasGallery && (
              <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10" aria-label="Cambiar imagen">
                {imageList.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setGalleryIndex(i); galleryIndexRef.current = i; }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 min-w-2 min-h-2 ${i === galleryIndex ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'}`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                    aria-label={`Imagen ${i + 1} de ${Math.min(imageList.length, 5)}`}
                    aria-current={i === galleryIndex ? 'true' : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>
    </article>
  )
})

export default ProductCard
 
