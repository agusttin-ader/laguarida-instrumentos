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

  if (!ready || !item || !imageSrc) return null

  return (
    <section aria-labelledby="home-hero" className="w-full">
      <div className="container-tight">
        <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#10131a] shadow-[0_20px_48px_rgba(0,0,0,0.36)]">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] min-h-[58vh] md:min-h-[64vh]">
            <div className="order-2 lg:order-1 relative z-10 p-5 sm:p-8 lg:p-10 bg-[#131823] border-t lg:border-t-0 lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-center">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4a43b] font-medium">Producto destacado</p>
              <h1 id="home-hero" className="mt-2 text-[1.9rem] sm:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-white">
                {item.name}
              </h1>
              {item.description ? (
                <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed line-clamp-4 max-w-xl">
                  {item.description}
                </p>
              ) : null}
              {item.price ? (
                <p className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-white">{item.price}</p>
              ) : null}

              {specs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {specs.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 text-xs rounded-full border border-white/15 bg-white/5 text-white/90">
                      {Array.isArray(s) ? s.join(', ') : s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/guitars/${item.slug || item.id || ''}`} className="btn-info">Ver producto</Link>
                <Link href="/#seleccion-destacada" className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl border border-white/25 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                  Ver catalogo
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative min-h-[40vh] lg:min-h-full">
              <ImageWithSkeleton
                src={imageSrc}
                alt={item.name || 'Producto destacado'}
                fill
                quality={90}
                sizes="(min-width:1024px) 65vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-black/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

