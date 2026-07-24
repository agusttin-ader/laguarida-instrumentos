"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import normalizeProduct from '../lib/utils/normalizeProduct'
import formatPriceDisplay from '../lib/utils/formatPriceDisplay'
import imageService from '../lib/utils/imageService'
import Link from 'next/link'
import { useFavorites } from './ProductShareAndFavorite'
import { useToast } from './ToastContext'
import { usePremiumImageFade } from '../hooks/usePremiumImageFade'
import { useResponsiveImageQuality } from '../hooks/useResponsiveImageQuality'
import { IMAGE_QUALITY_PRESETS } from '../lib/utils/responsiveImageQuality'
import { resolveProductBrandLogo } from '../lib/catalog/resolveProductBrandLogo'

const CARD_IMAGE_SIZES =
  '(max-width: 767px) 46vw, (max-width: 1023px) 46vw, (max-width: 1535px) 31vw, (max-width: 1919px) 28vw, 24vw'
const CARD_IMAGE_SIZES_CAROUSEL =
  '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, (max-width: 1535px) 31vw, (max-width: 1919px) 28vw, 24vw'
const SWIPE_DISTANCE_THRESHOLD = 48
const SWIPE_VELOCITY_THRESHOLD = 0.35
const GALLERY_MOUNT_RADIUS = 1
const MOBILE_ONLY_QUERY = '(max-width: 767px)'

function getInitialMediaMatch(query) {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

function ProductCardImage({
  src,
  alt,
  priority = false,
  eager = false,
  fitClassName = '',
  style,
  onReady,
  pointerEventsNone = false,
  sizes = CARD_IMAGE_SIZES,
  brandLogo = null,
}) {
  const { loaded, onImageLoad, opacityClass, transitionClass } = usePremiumImageFade(src)
  const cardQuality = useResponsiveImageQuality(IMAGE_QUALITY_PRESETS.card)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  const handleLoad = useCallback(() => {
    setErrored(false)
    onImageLoad()
    onReady?.()
  }, [onImageLoad, onReady])

  const handleError = useCallback(() => {
    setErrored(true)
  }, [])

  const showFallback = !loaded || errored

  return (
    <>
      {showFallback ? (
        <div className="product-card-image-fallback absolute inset-0 z-0" aria-hidden>
          {brandLogo?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brandLogo.src}
              alt=""
              className="product-card-image-fallback__logo"
            />
          ) : (
            <span className="product-card-image-fallback__mark">LG</span>
          )}
        </div>
      ) : null}
      {!errored ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={cardQuality}
          unoptimized={imageService.shouldBypassNextOptimization(src)}
          priority={priority}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`${opacityClass} ${transitionClass} ${pointerEventsNone ? 'pointer-events-none' : ''} ${fitClassName}`}
          style={style}
        />
      ) : null}
    </>
  )
}

const ProductCard = React.memo(function ProductCard({
  item,
  priority = false,
  /** Carga eager sin priority (p. ej. resto de la primera fila desktop). */
  eager = false,
  imageFit = 'cover',
  galleryDesktopOnly = false,
  maxGalleryImages = 3,
  inCarousel = false,
  showBrandLogo = true,
}) {
  const loadEager = Boolean(priority || eager)
  const p = normalizeProduct(item)
  const catalogSingleImage = maxGalleryImages <= 1
  const [desktopGalleryUnlocked, setDesktopGalleryUnlocked] = useState(() =>
    catalogSingleImage || !galleryDesktopOnly ? false : !getInitialMediaMatch(MOBILE_ONLY_QUERY)
  )
  const [isMobile, setIsMobile] = useState(() => getInitialMediaMatch(MOBILE_ONLY_QUERY))

  useEffect(() => {
    if (catalogSingleImage) return
    const mq = window.matchMedia(MOBILE_ONLY_QUERY)
    const sync = () => {
      setIsMobile(mq.matches)
      if (galleryDesktopOnly) setDesktopGalleryUnlocked(!mq.matches)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [catalogSingleImage, galleryDesktopOnly])

  const effectivePrimaryOnly =
    catalogSingleImage || isMobile || (galleryDesktopOnly && !desktopGalleryUnlocked)

  const imageList = useMemo(() => {
    const main = imageService.resolve(p.image_url)
    const resolved = (Array.isArray(p.images) ? p.images : p.image_url ? [p.image_url] : [])
      .map((src) => imageService.resolve(src))
      .filter(Boolean)
    const rest = resolved.filter((url) => url !== main)
    const list = main ? [main, ...rest] : rest
    const capped = list.slice(0, Math.max(1, maxGalleryImages))
    const withDisplay = capped.map((u) => imageService.forDisplay(u, 'card') || u)
    if (effectivePrimaryOnly) return withDisplay.slice(0, 1)
    return withDisplay
  }, [p.images, p.image_url, effectivePrimaryOnly, maxGalleryImages])

  const [galleryIndex, setGalleryIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const didSwipe = useRef(false)

  const titleText = p.name || ''
  const headingId = `product-title-${p.slug || p.id}`
  const specs = []
  if (p.mics) specs.push(String(p.mics).trim())
  if (p.wood) specs.push(String(p.wood).trim())
  if (p.model) specs.push(String(p.model).trim())
  const visibleSpecs = specs.slice(0, 2)
  const hiddenSpecsCount = Math.max(0, specs.length - visibleSpecs.length)
  const objectFit = imageFit === 'contain' ? 'contain' : 'cover'
  const hasGallery = !catalogSingleImage && imageList.length > 1
  const { toast } = useToast()
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(p.slug)
  const primarySrc = imageList[0]
  const cardImageSizes = inCarousel ? CARD_IMAGE_SIZES_CAROUSEL : CARD_IMAGE_SIZES
  const brandLogo = useMemo(
    () => (showBrandLogo ? resolveProductBrandLogo(item) : null),
    [item, showBrandLogo]
  )
  const imageFitClassName = [
    'max-[767px]:object-contain max-[767px]:object-center',
    objectFit === 'contain' ? 'md:object-contain' : 'md:object-cover',
  ].join(' ')

  function goToIndex(nextIndex) {
    setGalleryIndex(() => Math.max(0, Math.min(imageList.length - 1, nextIndex)))
  }

  useEffect(() => {
    setGalleryIndex((i) => Math.max(0, Math.min(i, Math.max(0, imageList.length - 1))))
  }, [imageList.length, primarySrc])

  function handleTouchStart(e) {
    if (!e.touches[0]) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = typeof performance !== 'undefined' ? performance.now() : Date.now()
    didSwipe.current = false
  }
  function handleTouchEnd(e) {
    if (!hasGallery || !e.changedTouches[0]) return
    const x = e.changedTouches[0].clientX
    const y = e.changedTouches[0].clientY
    const dx = x - touchStartX.current
    const dy = y - touchStartY.current
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dy) > 32) return
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const dt = Math.max(now - touchStartTime.current, 1)
    const velocity = Math.abs(dx) / dt
    const strongFlick = velocity >= SWIPE_VELOCITY_THRESHOLD && Math.abs(dx) >= 24
    const farEnough = Math.abs(dx) >= SWIPE_DISTANCE_THRESHOLD
    if (!farEnough && !strongFlick) return
    if (dx < 0 && galleryIndex < imageList.length - 1) {
      didSwipe.current = true
      goToIndex(galleryIndex + 1)
    } else if (dx > 0 && galleryIndex > 0) {
      didSwipe.current = true
      goToIndex(galleryIndex - 1)
    }
  }
  function handleGalleryDotClick(e, index) {
    e.preventDefault()
    e.stopPropagation()
    goToIndex(index ?? galleryIndex)
  }
  function handleArrowClick(e, delta) {
    e.preventDefault()
    e.stopPropagation()
    goToIndex(galleryIndex + delta)
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
      className={`product-card-mobile-shell relative w-full overflow-hidden bg-[var(--dark-surface-2)] aspect-[4/5] md:aspect-[3/4] select-none ${hasGallery ? 'touch-pan-y' : inCarousel ? 'touch-pan-x' : 'touch-auto'}`}
      onTouchStart={hasGallery ? handleTouchStart : undefined}
      onTouchEnd={hasGallery ? handleTouchEnd : undefined}
      onTouchCancel={hasGallery ? handleTouchEnd : undefined}
    >
      {primarySrc ? (
        <>
          {catalogSingleImage ? (
            <ProductCardImage
              src={primarySrc}
              alt={titleText || 'Imagen del producto'}
              priority={priority}
              eager={loadEager}
              fitClassName={imageFitClassName}
              style={{ objectPosition: 'center' }}
              pointerEventsNone={inCarousel}
              sizes={cardImageSizes}
              brandLogo={brandLogo}
            />
          ) : (
            imageList.map((src, idx) => {
              if (Math.abs(idx - galleryIndex) > GALLERY_MOUNT_RADIUS) return null
              const isActive = idx === galleryIndex
              const isMainSlot = idx === 0
              const slotEager = Boolean(loadEager && isMainSlot && isActive)
              return (
                <div
                  key={idx}
                  className="absolute inset-0 transition-opacity duration-200 ease-out motion-reduce:transition-none"
                  style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    zIndex: isActive ? 1 : 0,
                  }}
                >
                  <ProductCardImage
                    src={src}
                    alt={idx === 0 ? (titleText || 'Imagen del producto') : `Imagen ${idx + 1} de ${titleText || 'producto'}`}
                    priority={Boolean(priority && isMainSlot && isActive)}
                    eager={slotEager}
                    fitClassName={imageFitClassName}
                    style={{ objectPosition: 'center' }}
                    sizes={cardImageSizes}
                    brandLogo={brandLogo}
                  />
                </div>
              )
            })
          )}
        </>
      ) : (
        <div className="product-card-image-fallback absolute inset-0 flex items-center justify-center" aria-hidden>
          {brandLogo?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brandLogo.src} alt="" className="product-card-image-fallback__logo" />
          ) : (
            <span className="product-card-image-fallback__mark">LG</span>
          )}
        </div>
      )}
      {hasGallery && !isMobile ? (
        <>
          <div className="absolute inset-0 z-10 pointer-events-none">
            <button
              type="button"
              onClick={(e) => handleArrowClick(e, -1)}
              disabled={galleryIndex === 0}
              aria-label="Imagen anterior"
              className={`no-custom-btn pointer-events-auto absolute left-1.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/58 text-white shadow-md transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:h-10 md:w-10 md:border-0 md:bg-transparent md:shadow-none [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.55))] active:scale-95 touch-manipulation ${
                galleryIndex === 0
                  ? 'cursor-default opacity-35 md:opacity-0 md:group-hover/img:opacity-40'
                  : 'opacity-100 md:opacity-0 md:group-hover/img:opacity-100 hover:bg-black/60 md:hover:bg-transparent'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => handleArrowClick(e, 1)}
              disabled={galleryIndex === imageList.length - 1}
              aria-label="Siguiente imagen"
              className={`no-custom-btn pointer-events-auto absolute right-1.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/58 text-white shadow-md transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:h-10 md:w-10 md:border-0 md:bg-transparent md:shadow-none [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.55))] active:scale-95 touch-manipulation ${
                galleryIndex === imageList.length - 1
                  ? 'cursor-default opacity-35 md:opacity-0 md:group-hover/img:opacity-40'
                  : 'opacity-100 md:opacity-0 md:group-hover/img:opacity-100 hover:bg-black/60 md:hover:bg-transparent'
              }`}
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
      ) : null}
      {brandLogo ? (
        <div
          className="product-card-brand-badge product-card-brand-badge--overlay pointer-events-none absolute bottom-1.5 left-1.5 z-10 flex max-w-[calc(100%-3rem)] items-center rounded-md border border-white/10 bg-black/58 px-1 py-0.5 backdrop-blur-[2px] md:hidden"
          title={brandLogo.label}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brandLogo.src}
            alt=""
            className="product-card-brand-logo h-3 w-auto max-w-[2.75rem] object-contain object-left brightness-0 invert opacity-90"
          />
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleFavoriteClick}
        aria-label={fav ? 'Quitar de tu selección' : 'Agregar a tu selección'}
        className="no-custom-btn favorite-heart-btn absolute top-2 right-2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 md:w-10 md:h-10 flex items-center justify-center rounded-full border bg-black/62 border-white/25 text-white/90 hover:bg-black/75 hover:border-white/40 transition-all duration-200 touch-manipulation"
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
    </div>
  )

  const productHref = `/guitars/${p.slug || p.id}`
  const cardLinkClassName =
    'no-custom-btn card-product-link group group/img flex h-full min-h-0 flex-1 flex-col transition-transform duration-120 ease-out max-md:active:scale-100 md:active:scale-[0.99]'

  const cardBody = (
    <>
      {imageBlock}

      <div className="product-card-body flex min-h-0 flex-1 flex-col p-4 max-[767px]:gap-0 max-[767px]:px-2.5 max-[767px]:pb-2.5 max-[767px]:pt-2 md:min-h-[10.25rem] md:gap-0 md:p-5">
        {brandLogo ? (
          <div
            className="product-card-brand-badge product-card-brand-badge--body order-0 mb-2 hidden min-h-[1.125rem] items-center md:flex md:mb-2.5"
            title={brandLogo.label}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandLogo.src}
              alt=""
              className="product-card-brand-logo h-4 w-auto max-w-[4.5rem] object-contain object-left brightness-0 invert opacity-[0.88] lg:h-[1.125rem] lg:max-w-[5rem]"
            />
          </div>
        ) : null}
        <h3
          id={headingId}
          className="order-1 min-h-0 min-w-0 text-[1rem] font-semibold tracking-tight text-[var(--dark-text-primary)] line-clamp-3 md:line-clamp-2 md:min-h-[2.75rem] md:text-[1.0625rem] max-[767px]:text-[0.8125rem] max-[767px]:font-semibold max-[767px]:leading-[1.3] md:leading-snug"
        >
          {titleText}
        </h3>
        <div className="order-2 mt-0.5 min-h-0 product-card-specs-mobile max-[767px]:block md:hidden">
          {specs.length > 0 ? (
            <p
              className="truncate text-xs font-medium uppercase leading-snug tracking-wider text-[var(--dark-muted)]"
              title={[...visibleSpecs, hiddenSpecsCount > 0 ? `+${hiddenSpecsCount}` : null].filter(Boolean).join(' · ')}
            >
              {[...visibleSpecs, hiddenSpecsCount > 0 ? `+${hiddenSpecsCount}` : null].filter(Boolean).join(' · ')}
            </p>
          ) : null}
        </div>
        <div className="order-3 mt-2.5 hidden min-h-[1.75rem] flex-wrap gap-1.5 md:flex max-[767px]:hidden">
          {visibleSpecs.map((s, i) => (
            <span key={i} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--dark-muted)] md:text-[11px]">
              {s}
            </span>
          ))}
          {hiddenSpecsCount > 0 && (
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--dark-muted)] md:text-[11px]">
              +{hiddenSpecsCount}
            </span>
          )}
        </div>
        <p
          className={`price-highlight order-3 mt-1 min-h-0 text-sm font-semibold max-[767px]:mt-1 max-[767px]:text-[0.875rem] md:order-2 md:mt-1.5 md:min-h-[1.375rem] md:text-base ${p.price ? '' : 'invisible'}`}
        >
          {p.price ? formatPriceDisplay(p.price) : '—'}
        </p>
        <span className="order-4 mt-auto hidden items-center gap-1.5 pt-3 text-xs font-medium text-[var(--dark-text-secondary)] max-[767px]:hidden md:inline-flex">
          Ver producto
          <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </>
  )

  return (
    <article
      aria-labelledby={headingId}
      className="card-interactive card-editorial card-mobile-no-motion product-card-mobile-catalog flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl max-md:rounded-xl max-md:border max-md:border-white/[0.06] border-0 bg-[var(--dark-bg-card)] max-md:shadow-none md:rounded-3xl"
    >
      {inCarousel ? (
        <div className={cardLinkClassName}>{cardBody}</div>
      ) : (
        <Link
          href={productHref}
          aria-label={`Ir a ${titleText || 'producto'}`}
          className={cardLinkClassName}
          onClick={handleCardClick}
        >
          {cardBody}
        </Link>
      )}
    </article>
  )
})

export default ProductCard
