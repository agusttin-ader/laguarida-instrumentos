"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'
import { useProducts } from '../hooks/useProducts'

function hashString(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function pickFeatured(items = [], dayKey = '') {
  if (!items.length) return null
  const ranked = items
    .filter((p) => (p.slug || p.id) && (p.image_url || (p.images && p.images[0])) && p.name)
    .sort((a, b) => {
      const aScore = Number(Boolean(a.price)) + Number(Boolean(a.description)) + Number(Boolean(a.model || a.wood || a.mics))
      const bScore = Number(Boolean(b.price)) + Number(Boolean(b.description)) + Number(Boolean(b.model || b.wood || b.mics))
      return bScore - aScore
    })
  if (!ranked.length) return null
  const pool = ranked.slice(0, Math.min(ranked.length, 12))
  const idx = hashString(dayKey || new Date().toDateString()) % pool.length
  return pool[idx]
}

export default function HeroMonolith() {
  const { products, loading } = useProducts({ shuffleCatalog: false })

  const item = useMemo(() => {
    if (!products.length) return null
    const dayKey = typeof window !== 'undefined'
      ? `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
      : ''
    return pickFeatured(products, dayKey)
  }, [products])

  const imageSrc = useMemo(() => imageService.resolve(item?.image_url || (item?.images && item.images[0]) || ''), [item])
  const specs = useMemo(() => [item?.model, item?.wood, item?.mics].filter(Boolean).slice(0, 3), [item])
  const specLine = useMemo(
    () => specs.map((s) => (Array.isArray(s) ? s.join(', ') : s)).join(' · '),
    [specs]
  )

  if (loading || !item || !imageSrc) return null

  return (
    <section aria-labelledby="home-hero" className="w-full">
      <div className="container-tight">
        <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1119] shadow-[0_24px_56px_rgba(0,0,0,0.42)]">
          <div className="pointer-events-none absolute -left-16 top-1/4 h-48 w-48 rounded-full bg-[#d4a43b]/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#5c78c4]/12 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] min-h-[60vh] md:min-h-[68vh]">
            <div className="order-1 relative min-h-[44vh] lg:min-h-full">
              <ImageWithSkeleton
                src={imageSrc}
                alt={item.name || 'Producto destacado'}
                fill
                quality={100}
                sizes="(min-width:1024px) 65vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none lg:bg-gradient-to-r lg:from-black/55 lg:via-transparent lg:to-transparent" />
            </div>

            <div className="order-2 relative z-10 p-5 sm:p-8 lg:p-10 bg-gradient-to-b from-[#131823]/95 to-[#0e131d]/95 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-center">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4a43b] font-medium">Producto destacado</p>
              <h1 id="home-hero" className="mt-2 text-[1.95rem] sm:text-4xl lg:text-[3.1rem] font-bold leading-[1.03] tracking-tight text-white">
                {item.name}
              </h1>
              {item.description ? (
                <p className="mt-4 text-sm sm:text-base text-white/82 leading-relaxed line-clamp-4 max-w-xl">
                  {item.description}
                </p>
              ) : null}
              {item.price ? (
                <p className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-white">{item.price}</p>
              ) : null}

              {specs.length > 0 && (
                <div className="mt-4 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Specs</p>
                  <p className="mt-1 text-sm text-white/90 leading-relaxed">{specLine}</p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Link href={`/guitars/${item.slug || item.id || ''}`} className="no-custom-btn inline-flex items-center justify-center min-h-[46px] px-4 rounded-xl border border-white/70 bg-[rgba(255,255,255,0.92)] text-black text-[13px] font-semibold whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(0,0,0,0.24)] active:translate-y-0">
                  Ver detalles
                </Link>
                <Link href="/#seleccion-destacada" className="no-custom-btn inline-flex items-center justify-center min-h-[46px] px-4 rounded-xl border border-white/28 bg-white/8 text-white text-[13px] font-semibold whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/14 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.28)] active:translate-y-0">
                  Ver catalogo
                </Link>
                <a
                  href={`https://wa.me/5491154661749?text=${encodeURIComponent('Hola, me interesa La Guarida, me podrias dar informacion?')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contactar por WhatsApp"
                  className="no-custom-btn inline-flex items-center justify-center min-h-[46px] w-12 px-0 rounded-xl border border-[#d4a43b]/50 bg-[#d4a43b]/16 text-[#f3d399] text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#d4a43b]/24 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(212,164,59,0.28)] active:translate-y-0"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

