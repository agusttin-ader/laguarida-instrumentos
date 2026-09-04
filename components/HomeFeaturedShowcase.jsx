"use client"

import React from 'react'
import Link from 'next/link'
import Button from './Button'
import normalizeProduct from '../lib/utils/normalizeProduct'
import formatPriceDisplay from '../lib/utils/formatPriceDisplay'
import { pickShowcaseImage } from '../lib/utils/pickShowcaseImage'
import {
  getProductDisplayTitle,
  resolveProductBrandLogo,
} from '../lib/catalog/resolveProductBrandLogo'
import ImageWithSkeleton from './ImageWithSkeleton'
import ProductGridMotion from './motion/ProductGridMotion'
import imageService from '../lib/utils/imageService'

const HOME_PICK_COUNT = 3
const EDITORIAL_IMAGE_SIZES = '(max-width: 767px) 100vw, 50vw'

function excerptDescription(text, maxLen = 260) {
  if (!text) return ''
  const clean = String(text).replace(/\s+/g, ' ').trim()
  const first = clean.split(/\n\n/)[0] || clean
  if (first.length <= maxLen) return first
  return `${first.slice(0, maxLen).replace(/\s+\S*$/, '')}…`
}

function pickSpecs(product) {
  return [product.model, product.mics, product.wood].map((v) => String(v || '').trim()).filter(Boolean).slice(0, 3)
}

function EditorialBlock({ item, index, reversed = false }) {
  const p = normalizeProduct(item)
  const brandLogo = resolveProductBrandLogo(item)
  const displayTitle = getProductDisplayTitle(p, brandLogo)
  const src = pickShowcaseImage(p)
  const href = `/guitars/${p.slug || p.id}`
  const specs = pickSpecs(p)
  const description = excerptDescription(p.description || p.highlights)

  return (
    <article
      className={`home-featured-editorial-block product-enter-cell w-full ${
        reversed ? 'home-featured-editorial-block--img-right' : 'home-featured-editorial-block--img-left'
      }`}
      style={{ '--enter-i': index }}
    >
      <Link
        href={href}
        className="no-custom-btn no-custom-btn--flat home-featured-editorial__link grid w-full grid-cols-1 md:grid-cols-2 md:min-h-[540px] lg:min-h-[580px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-inset"
        aria-label={`Ver ${p.name || 'producto'}`}
      >
        <div
          className={`home-featured-editorial__image relative order-1 min-h-[360px] max-md:min-h-[min(62vw,380px)] overflow-hidden bg-[var(--dark-surface-2)] md:min-h-0 md:h-full ${reversed ? 'md:order-2' : 'md:order-1'}`}
        >
          {src ? (
            <ImageWithSkeleton
              src={imageService.forDisplay(src, 'editorial') || src}
              fallbackSrc={src}
              alt={p.name || 'Instrumento destacado'}
              fill
              sizes={EDITORIAL_IMAGE_SIZES}
              qualityPreset="editorial"
              priority={false}
              loading="lazy"
              imgClassName="object-cover object-[center_55%] sm:object-[center_60%] md:object-[center_65%]"
              disableClientPreview
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl opacity-25" aria-hidden>
              🎸
            </div>
          )}
        </div>

        <div
          className={`home-featured-editorial__content order-2 flex flex-col justify-center bg-[var(--dark-bg-card)] px-5 py-7 max-md:px-4 max-md:py-6 md:px-10 md:py-12 lg:px-14 xl:px-20 ${reversed ? 'md:order-1' : 'md:order-2'}`}
        >
          {specs.length > 0 ? (
            <p className="mb-4 flex flex-wrap gap-2">
              {specs.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dark-muted)]"
                >
                  {s}
                </span>
              ))}
            </p>
          ) : null}

          {brandLogo ? (
            <img
              src={brandLogo.src}
              alt={brandLogo.label}
              className="home-featured-editorial__brand-logo"
            />
          ) : null}

          <h3 className="text-[clamp(1.35rem,2.8vw,2rem)] font-bold leading-[1.12] tracking-tight text-[var(--dark-text-primary)]">
            {displayTitle}
          </h3>

          {p.price ? (
            <p className="price-highlight mt-3 text-base font-semibold sm:text-lg">{formatPriceDisplay(p.price)}</p>
          ) : null}

          {description ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--dark-text-secondary)] sm:mt-5 sm:text-base">
              {description}
            </p>
          ) : null}

          <div className="mt-7 sm:mt-8">
            <span className="home-featured-editorial__cta">
              Ver producto
              <svg className="icon-accent-gold h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

function ShowcaseSkeleton() {
  return (
    <div className="home-featured-editorial__skeleton w-full" aria-hidden>
      <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-[540px]">
        <div className="min-h-[360px] animate-pulse bg-[var(--dark-surface-2)] sm:min-h-[420px]" />
        <div className="space-y-4 bg-[var(--dark-bg-card)] p-8">
          <div className="h-6 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-7 w-4/5 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-white/10" />
          <div className="h-16 w-full animate-pulse rounded bg-white/10" />
          <div className="h-11 w-36 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  )
}

export default function HomeFeaturedShowcase({ items = [], loading = false }) {
  const picks = (Array.isArray(items) ? items : []).slice(0, HOME_PICK_COUNT)

  if (loading) {
    return (
      <div className="home-featured-editorial w-full">
        {Array.from({ length: HOME_PICK_COUNT }).map((_, i) => (
          <ShowcaseSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!picks.length) {
    return (
      <p className="mx-auto max-w-3xl px-5 py-8 text-center text-sm text-[var(--dark-muted)]">
        Pronto vas a ver acá nuestras novedades.
      </p>
    )
  }

  return (
    <ProductGridMotion className="home-featured-editorial product-grid--enter w-full">
      {picks.map((item, idx) => (
        <EditorialBlock key={item.slug || item.id || idx} item={item} index={idx} reversed={idx === 1} />
      ))}
    </ProductGridMotion>
  )
}

export function HomeFeaturedCatalogLink() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5">
      <Button href="/catalogo" variant="gold-gradient">
        Explorar catálogo
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Button>
    </div>
  )
}
