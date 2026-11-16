'use client'

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import normalizeProduct from '../lib/utils/normalizeProduct'
import formatPriceDisplay from '../lib/utils/formatPriceDisplay'
import imageService from '../lib/utils/imageService'
import { useFavorites } from './ProductShareAndFavorite'
import { useToast } from './ToastContext'
import { resolveProductBrandLogo, resolveProductImageFallbackLogo } from '../lib/catalog/resolveProductBrandLogo'
import {
  CARD_IMAGE_SIZES,
  CARD_IMAGE_SIZES_CAROUSEL,
  ProductCardImageFallback,
  collectProductSpecs,
} from './productCardShared'

/**
 * Card de catálogo (1 imagen): sin swipe, sin matchMedia ni galería — menos JS por celda.
 */
const ProductCardCatalogLite = React.memo(function ProductCardCatalogLite({
  item,
  priority = false,
  eager = false,
  imageFit = 'cover',
  inCarousel = false,
  showBrandLogo = true,
}) {
  const loadEager = Boolean(priority || eager)
  const p = normalizeProduct(item)
  const titleText = p.name || ''
  const headingId = `product-title-${p.slug || p.id}`
  const { visibleSpecs, hiddenSpecsCount, specs } = collectProductSpecs(p)
  const objectFit = imageFit === 'contain' ? 'contain' : 'cover'
  const { toast } = useToast()
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(p.slug)

  const primarySrc = useMemo(() => {
    const main = imageService.resolve(p.image_url)
    if (main) return main
    const resolved = (Array.isArray(p.images) ? p.images : [])
      .map((src) => imageService.resolve(src))
      .filter(Boolean)
    return resolved[0] || null
  }, [p.image_url, p.images])

  const displayPreset = inCarousel ? 'carousel' : 'card'
  const displaySrc = primarySrc ? imageService.forDisplay(primarySrc, displayPreset) || primarySrc : null
  const cardSrcSet = primarySrc ? imageService.forCardSrcSet(primarySrc) : null

  const cardImageSizes = inCarousel ? CARD_IMAGE_SIZES_CAROUSEL : CARD_IMAGE_SIZES
  const brandLogo = useMemo(
    () => (showBrandLogo ? resolveProductBrandLogo(item) : null),
    [item, showBrandLogo]
  )
  const imageFallbackLogo = useMemo(() => resolveProductImageFallbackLogo(item), [item])

  const imageFitClassName = [
    'max-[767px]:object-contain max-[767px]:object-center',
    objectFit === 'contain' ? 'md:object-contain' : 'md:object-cover',
  ].join(' ')

  const [imgReady, setImgReady] = useState(false)
  const [errored, setErrored] = useState(false)
  const [activeSrc, setActiveSrc] = useState(displaySrc)

  useEffect(() => {
    setActiveSrc(displaySrc)
    setImgReady(false)
    setErrored(false)
  }, [displaySrc])

  const handleLoad = useCallback(() => {
    setErrored(false)
    setImgReady(true)
  }, [])

  const handleError = useCallback(() => {
    if (primarySrc && activeSrc !== primarySrc) {
      setActiveSrc(primarySrc)
      return
    }
    setErrored(true)
  }, [activeSrc, primarySrc])

  const handleFavoriteClick = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      toggle(p.slug)
      toast(fav ? 'Quitar de tu selección' : 'Agregado a tu selección', 'default')
    },
    [fav, p.slug, toggle, toast]
  )

  const productHref = `/guitars/${p.slug || p.id}`
  const cardLinkClassName =
    'no-custom-btn card-product-link group group/img flex h-full min-h-0 flex-1 flex-col transition-transform duration-120 ease-out max-md:active:scale-100 md:active:scale-[0.99]'

  const cardBody = (
    <>
      <div
        className={`product-card-mobile-shell relative w-full overflow-hidden bg-[var(--dark-surface-2)] aspect-[4/5] md:aspect-[3/4] select-none ${
          inCarousel ? 'touch-manipulation' : 'touch-auto'
        }`}
      >
        {displaySrc && !errored ? (
          <>
            {!imgReady ? (
              <div className="product-card-image-fallback absolute inset-0 z-0" aria-hidden>
                <ProductCardImageFallback logo={imageFallbackLogo} />
              </div>
            ) : null}
            <Image
              src={activeSrc}
              alt={titleText || 'Imagen del producto'}
              fill
              sizes={cardImageSizes}
              srcSet={cardSrcSet || undefined}
              unoptimized
              priority={priority}
              loading={loadEager ? 'eager' : 'lazy'}
              fetchPriority={loadEager ? 'high' : 'auto'}
              decoding="async"
              onLoad={handleLoad}
              onError={handleError}
              className={`${imgReady ? 'opacity-100' : 'opacity-0'} ${
                inCarousel ? 'pointer-events-none' : ''
              } ${imageFitClassName}`}
              style={{ objectPosition: 'center' }}
            />
          </>
        ) : (
          <div className="product-card-image-fallback absolute inset-0 flex items-center justify-center" aria-hidden>
            <ProductCardImageFallback logo={imageFallbackLogo} />
          </div>
        )}
        {brandLogo ? (
          <div
            className="product-card-brand-badge product-card-brand-badge--overlay pointer-events-none absolute bottom-1.5 left-1.5 z-10 flex max-w-[calc(100%-3rem)] items-center rounded-md bg-black/58 px-1 py-0.5 md:hidden"
            title={brandLogo.label}
            aria-hidden
          >
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

      <div className="product-card-body flex min-h-0 flex-1 flex-col p-4 max-[767px]:gap-0 max-[767px]:px-2.5 max-[767px]:pb-2.5 max-[767px]:pt-2 md:min-h-[10.25rem] md:gap-0 md:p-5">
        {brandLogo ? (
          <div
            className="product-card-brand-badge product-card-brand-badge--body order-0 mb-2 hidden min-h-[1.125rem] items-center md:flex md:mb-2.5"
            title={brandLogo.label}
            aria-hidden
          >
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
            <span
              key={i}
              className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--dark-muted)] md:text-[11px]"
            >
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
          <svg
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
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
        <Link href={productHref} aria-label={`Ir a ${titleText || 'producto'}`} className={cardLinkClassName}>
          {cardBody}
        </Link>
      )}
    </article>
  )
})

export default ProductCardCatalogLite