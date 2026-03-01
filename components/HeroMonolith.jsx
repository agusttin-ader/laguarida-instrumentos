"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ImageWithSkeleton from './ImageWithSkeleton'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'

function hashString(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function pickFeatured(items = [], dayKey = '') {
  if (!items.length) return null
  // Favor products with complete content, then pick deterministic by day.
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
  const [item, setItem] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        const normalized = Array.isArray(data) ? data.map((d) => normalizeProduct(d)) : []
        const now = new Date()
        const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
        const featured = pickFeatured(normalized, dayKey)
        if (mounted) setItem(featured)
      } catch {
        if (mounted) setItem(null)
      } finally {
        if (mounted) setReady(true)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const imageSrc = useMemo(() => imageService.resolve(item?.image_url || (item?.images && item.images[0]) || ''), [item])
  const specs = useMemo(() => [item?.model, item?.wood, item?.mics].filter(Boolean).slice(0, 3), [item])
  const specLine = useMemo(
    () => specs.map((s) => (Array.isArray(s) ? s.join(', ') : s)).join(' · '),
    [specs]
  )

  if (!ready || !item || !imageSrc) return null

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
                  href={`https://wa.me/541168696491?text=${encodeURIComponent(`Hola! Me interesa la ${item.name}. Me compartis mas info?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-custom-btn inline-flex items-center justify-center min-h-[46px] px-4 rounded-xl border border-[#d4a43b]/50 bg-[#d4a43b]/16 text-[#f3d399] text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#d4a43b]/24 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(212,164,59,0.28)] active:translate-y-0"
                >
                  Consultar
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

