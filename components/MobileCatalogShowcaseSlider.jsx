'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'

const SLIDE_MS = 5200
const SIZES = '(max-width: 768px) 100vw, (max-width: 1535px) min(92vw, 720px), min(880px, 46vw)'

/**
 * Carrusel automático (solo móvil en layout padre): portadas del catálogo, imagen completa (object-contain).
 */
export default function MobileCatalogShowcaseSlider({ items = [], loading = false, className = '' }) {
  const slides = useMemo(() => {
    if (!Array.isArray(items) || !items.length) return []
    return items
      .map((raw, idx) => {
        const p = normalizeProduct(raw)
        const resolved = imageService.resolve(p.image_url)
        const src = resolved || (typeof p.image_url === 'string' ? p.image_url.trim() : '')
        if (!src) return null
        const slug = p.slug ? String(p.slug) : ''
        const href = slug ? `/guitars/${encodeURIComponent(slug)}` : '#'
        return {
          key: `slide-${idx}-${slug || p.id || src.slice(-24)}`,
          src,
          href,
          name: p.name || 'Instrumento'
        }
      })
      .filter(Boolean)
  }, [items])

  const [index, setIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    setIndex(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [slides.length, reduceMotion])

  if (loading) {
    return (
      <div
        className={`mobile-catalog-showcase relative aspect-[4/5] w-full max-h-[min(78dvh,640px)] overflow-hidden bg-[var(--dark-surface-2)] ${className}`}
        aria-busy="true"
        aria-label="Cargando muestra del catálogo"
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-white/6 to-transparent" />
      </div>
    )
  }

  if (!slides.length) return null

  const current = slides[Math.min(index, slides.length - 1)]

  return (
    <div
      className={`mobile-catalog-showcase group relative aspect-[4/5] w-full max-h-[min(78dvh,640px)] overflow-hidden bg-[#0a0a0a] ${className}`}
    >
      <Link
        href={current.href}
        className="absolute inset-0 z-[1] flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-inset"
        aria-label={current.name ? `Ver ${current.name}` : 'Ver instrumento'}
      >
        <div className="relative h-full w-full">
          {slides.map((s, i) => (
            <div
              key={s.key}
              className="absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
              style={{
                opacity: i === index ? 1 : 0,
                pointerEvents: i === index ? 'auto' : 'none'
              }}
              aria-hidden={i !== index}
            >
              <Image
                src={s.src}
                alt={s.name}
                fill
                sizes={SIZES}
                className="object-contain object-center"
                quality={88}
                priority={i === 0}
                fetchPriority={i === 0 ? 'high' : 'low'}
              />
            </div>
          ))}
        </div>
      </Link>

      {slides.length > 1 ? (
        <div
          className="pointer-events-none absolute bottom-3 left-0 right-0 z-[2] flex justify-center gap-1.5"
          aria-hidden
        >
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-[var(--vintage-gold)]' : 'w-1.5 bg-white/35'
              }`}
            />
          ))}
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 z-[2] bg-gradient-to-t from-black/75 via-black/20 to-transparent"
        aria-hidden
      />
    </div>
  )
}
