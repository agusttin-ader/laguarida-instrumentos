"use client";

import React, { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import Link from 'next/link'
import { useFavorites } from './ProductShareAndFavorite'
import { useToast } from './ToastContext'

// Alineado al grid (1 / 2 / 3 cols + padding del contenedor); evita warning de Next por 100vw en tarjetas más angostas
const CARD_IMAGE_SIZES = '(max-width: 639px) min(92vw, 560px), (max-width: 1023px) min(46vw, 520px), min(34vw, 420px)'
const MAX_CARD_IMAGES = 3
const SWIPE_THRESHOLD = 36

const ProductCard = React.memo(function ProductCard({ item, priority = false, imageFit = 'cover' }) {
  const p = normalizeProduct(item)
  const imageList = useMemo(() => {
    const main = imageService.resolve(p.image_url)
    const resolved = (Array.isArray(p.images) ? p.images : p.image_url ? [p.image_url] : [])
      .map((src) => imageService.resolve(src))
      .filter(Boolean)
    const rest = resolved.filter((url) => url !== main)
    const list = main ? [main, ...rest] : rest
    return list.slice(0, MAX_CARD_IMAGES)
  }, [p.images, p.image_url])
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [loadedIndices, setLoadedIndices] = useState(() => new Set())
  const [isHoveringImage, setIsHoveringImage] = useState(false)
  const touchStartX = useRef(0)
  const didSwipe = useRef(false)
  const currentImageReady = loadedIndices.has(galleryIndex)
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
  const { toast } = useToast()
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(p.slug)

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    didSwipe.current = false
  }
  function handleTouchMove(e) {
    const dx = e.touches[0].clientX - touchStartX.current
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    didSwipe.current = true
    const current = galleryIndex
    const next = dx < 0 ? Math.min(current + 1, imageList.length - 1) : Math.max(current - 1, 0)
    if (next !== current) {
      setGalleryIndex(next)
      touchStartX.current = e.touches[0].clientX
    }
  }
  function handleGalleryDotClick(e, index) {
    e.preventDefault()
    e.stopPropagation()
    setGalleryIndex(index)
  }
  function handleArrowClick(e, delta) {
    e.preventDefault()
    e.stopPropagation()
    setGalleryIndex((prev) => Math.max(0, Math.min(imageList.length - 1, prev + delta)))
  }
  function handleCardClick(e) {
    if (didSwipe.current) {
      e.preventDefault()
      didSwipe.current = false
    }
  }

  function handleFavoriteClick(e) {
    e.preventDefault()
    e.stopPropagation()
    toggle(p.slug)
    toast(fav ? 'Quitar de tu selección' : 'Agregado a tu selección', 'default')
  }

  const imageBlock = (
    <div
      className="relative w-full overflow-hidden bg-[var(--dark-surface-2)] aspect-[4/5] md:aspect-[3/4] touch-pan-y"
      onTouchStart={hasGallery ? handleTouchStart : undefined}
      onTouchMove={hasGallery ? handleTouchMove : undefined}
      onMouseEnter={() => setIsHoveringImage(true)}
      onMouseLeave={() => setIsHoveringImage(false)}
    >
      {imageList.length > 0 ? (
        <>
          <div className={`absolute inset-0 bg-[var(--dark-surface-2)] transition-opacity duration-300 ${currentImageReady ? 'opacity-0 pointer-events-none' : 'animate-pulse'}`} aria-hidden />
          {imageList.map((src, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity duration-300 ease-out"
              style={{
                opacity: idx === galleryIndex ? 1 : 0,
                pointerEvents: idx === galleryIndex ? 'auto' : 'none'
              }}
            >
                <Image
                  src={src}
                  alt={idx === 0 ? (titleText || 'Imagen del producto') : `Imagen ${idx + 1} de ${titleText || 'producto'}`}
                  fill
                  sizes={CARD_IMAGE_SIZES}
                  quality={80}
                  loading={priority && idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={priority && idx === 0 ? 'high' : 'low'}
                  decoding="async"
                  onLoad={() => setLoadedIndices((prev) => new Set(prev).add(idx))}
                  onError={() => {}}
                  className={`img-reveal ${loadedIndices.has(idx) ? 'img-loaded' : ''} transition-opacity duration-300 ease-out md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.33,1,0.32,1)] md:group-hover/img:scale-[1.02]`}
                  style={{ objectFit: objectFit, objectPosition: 'center' }}
                />
            </div>
          ))}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--dark-surface-2)] animate-pulse">
          <span className="text-3xl opacity-40">🎸</span>
        </div>
      )}
      {hasGallery && (
        <>
          {/* Flechas: solo desktop, visibles al hover — blanco con sombra para contraste */}
          <div className="absolute inset-0 z-10 pointer-events-none md:pointer-events-auto">
            <button
              type="button"
              onClick={(e) => handleArrowClick(e, -1)}
              aria-label="Imagen anterior"
              className={`no-custom-btn absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white transition-opacity duration-200 focus:outline-none [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.55))] ${galleryIndex === 0 ? 'opacity-0 md:group-hover/img:opacity-40 cursor-default' : 'opacity-0 md:group-hover/img:opacity-100'}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => handleArrowClick(e, 1)}
              aria-label="Siguiente imagen"
              className={`no-custom-btn absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white transition-opacity duration-200 focus:outline-none [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.55))] ${galleryIndex === imageList.length - 1 ? 'opacity-0 md:group-hover/img:opacity-40 cursor-default' : 'opacity-0 md:group-hover/img:opacity-100'}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-10" aria-label="Cambiar imagen">
            {imageList.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => handleGalleryDotClick(e, i)}
                className={`no-custom-btn w-2 h-2 rounded-full transition-all duration-200 min-w-2 min-h-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)] ${i === galleryIndex ? '!bg-white border border-white/90 scale-110 ring-1 ring-white/35' : '!bg-white/45 border border-white/35 hover:!bg-white/70'}`}
                aria-label={`Imagen ${i + 1} de ${imageList.length}`}
                aria-current={i === galleryIndex ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
      {/* Favorito: corazón arriba a la derecha — área táctil ≥44px en móvil */}
      <button
        type="button"
        onClick={handleFavoriteClick}
        aria-label={fav ? 'Quitar de tu selección' : 'Agregar a tu selección'}
        className="no-custom-btn favorite-heart-btn absolute top-2 right-2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 md:w-10 md:h-10 flex items-center justify-center border bg-black/55 border-white/25 text-white/90 hover:bg-black/70 hover:border-white/40 backdrop-blur-sm transition-all duration-200 touch-manipulation"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={fav ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={fav ? 'text-red-500' : 'text-white'}
          aria-hidden
        >
          <path d="M20.8 7.6c0 5.8-8.8 11.4-8.8 11.4S3.2 13.4 3.2 7.6C3.2 5 5 3.2 7.6 3.2c1.7 0 3.3.9 4.4 2.3 1.1-1.4 2.7-2.3 4.4-2.3 2.6 0 4.4 1.8 4.4 4.4z" />
        </svg>
      </button>
      <div className="absolute inset-0 border border-white/[0.06] rounded-[inherit] pointer-events-none" aria-hidden />
    </div>
  )

  return (
    <article
      aria-labelledby={headingId}
      className={`card-interactive card-editorial card-mobile-no-motion w-full min-w-0 max-w-full overflow-hidden rounded-none md:rounded-[22px] border border-[var(--dark-border)] bg-[var(--dark-bg-card)] ${isHoveringImage ? 'card-hovering-image' : ''}`}
    >
      <Link
        href={`/guitars/${p.slug || p.id}`}
        aria-label={`Ir a ${titleText || 'producto'}`}
        className="no-custom-btn card-product-link group group/img flex flex-col h-full"
        onClick={handleCardClick}
      >
        {imageBlock}

        <div className="flex flex-col flex-1 p-4 md:p-5 border-t border-[var(--dark-border)]">
          <h3 id={headingId} className="text-[1rem] md:text-[1.0625rem] font-semibold text-[var(--dark-text-primary)] leading-tight line-clamp-2 tracking-tight">
            {titleText}
          </h3>
          {p.price && (
            <p className="mt-1.5 text-sm md:text-base font-semibold text-[var(--vintage-gold)]">
              {p.price}
            </p>
          )}
          {specs.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {visibleSpecs.map((s, i) => (
                <span key={i} className="text-[10px] md:text-[11px] uppercase tracking-wider text-[var(--dark-muted)] px-2 py-0.5 rounded border border-[var(--dark-border)]">
                  {s}
                </span>
              ))}
              {hiddenSpecsCount > 0 && (
                <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-[var(--dark-muted)] px-2 py-0.5 rounded border border-[var(--dark-border)]">
                  +{hiddenSpecsCount}
                </span>
              )}
            </div>
          )}
          <span className="mt-3 md:mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--dark-text-secondary)]">
            Ver producto
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  )
})

export default ProductCard
 
