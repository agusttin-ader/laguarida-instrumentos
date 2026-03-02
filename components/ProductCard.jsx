"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'
import Link from 'next/link'

const CARD_IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

function ProductCard({ item, priority = false, imageFit = 'cover' }) {
  const p = normalizeProduct(item)
  const rawImg = p.image_url || (p.images && p.images[0])
  const img = imageService.resolve(rawImg)
  const [errored, setErrored] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const titleText = p.name || ''
  const headingId = `product-title-${p.slug || p.id}`
  const specs = []
  if (p.mics) specs.push(String(p.mics).trim())
  if (p.wood) specs.push(String(p.wood).trim())
  if (p.model) specs.push(String(p.model).trim())
  const visibleSpecs = specs.slice(0, 2)
  const hiddenSpecsCount = Math.max(0, specs.length - visibleSpecs.length)
  const objectFit = imageFit === 'contain' ? 'contain' : 'cover'

  // (removed unused keyFragment helper) 

  return (
    <article
      aria-labelledby={headingId}
      className="card-interactive w-full rounded-[20px] overflow-hidden border border-white/10 bg-[#15161a] shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
    >
      <Link
        href={`/guitars/${p.slug || p.id}`}
        aria-label={`Ir a ${titleText || 'producto'}`}
        className="block no-custom-btn card-product-link"
      >
        {/* Image: 4/3 aspect, Next/Image for AVIF/WebP + elegant fade-in */}
        <div className="relative w-full overflow-hidden bg-[#242428]" style={{ aspectRatio: '5/4' }}>
          {img && !errored ? (
            <>
              <div className={`absolute inset-0 bg-[#242428] transition-opacity duration-300 ${imgLoaded ? 'opacity-0 pointer-events-none' : 'animate-pulse'}`} aria-hidden />
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
            <div className="w-full h-full flex items-center justify-center bg-[#242428] animate-pulse">
              <span className="text-3xl opacity-50">🎸</span>
            </div>
          )}

          {/* Desktop: overlay on image (hidden on mobile for cleaner tap targets) */}
          <div
            className="hidden md:flex absolute top-4 left-4 right-4 items-center justify-between px-4 py-3 rounded-xl border border-white/15"
            style={{
              background: 'rgba(15,18,24,0.55)',
              WebkitBackdropFilter: 'blur(10px) saturate(120%)',
              backdropFilter: 'blur(10px) saturate(120%)',
              zIndex: 20,
            }}
          >
            <div className="flex-1 min-w-0">
              <h3 id={headingId} className="text-base lg:text-lg font-semibold text-white leading-tight line-clamp-2">
                {titleText}
              </h3>
              {p.price && (
                <div className="text-sm font-semibold text-white/90 mt-1">{p.price}</div>
              )}
            </div>
            <div className="flex-shrink-0 ml-3">
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20">Ver detalles</span>
            </div>
          </div>

          {/* Lower-left: specs pills (trimmed to reduce visual noise) */}
          {specs.length ? (
            <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {visibleSpecs.map((s, i) => (
                <div key={i} className="bg-black/65 text-white/95 text-[11px] px-3 py-1 rounded-full border border-white/10">
                  {s}
                </div>
              ))}
              {hiddenSpecsCount > 0 ? (
                <div className="bg-black/55 text-white/80 text-[11px] px-2.5 py-1 rounded-full border border-white/10">
                  +{hiddenSpecsCount}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Mobile: card body below image (TripGlide-style full-width CTA) */}
        <div className="md:hidden px-4 py-4 bg-[#1a1b20] border-t border-white/10">
          <h3 className="text-base font-semibold text-white leading-snug line-clamp-2" aria-hidden>{titleText}</h3>
          {p.price && <p className="text-[15px] font-semibold text-white/85 mt-1.5">{p.price}</p>}
          <span className="card-mobile-cta no-custom-btn mt-3.5 flex items-center justify-center min-h-[46px] w-full rounded-xl !bg-[#f5f1e6] !text-[#111319] text-sm font-semibold py-3 border border-black/10 shadow-none">
            Ver más
          </span>
        </div>
      </Link>
    </article>
  )
}

export default ProductCard;
 
