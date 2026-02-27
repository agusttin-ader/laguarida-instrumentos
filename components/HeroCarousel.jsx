"use client"
import React, { useEffect, useState, useRef } from 'react'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'
import shuffleArray from '../lib/utils/shuffle'
import Link from 'next/link'

function pickRandom(a){
  if (!a || a.length === 0) return null
  return a[Math.floor(Math.random() * a.length)]
}

function classifyImageKeyword(src){
  if (!src) return null
  const s = src.toLowerCase()
  // keywords grouped by semantic category
  const groups = {
    mastil: ['mastil', 'mástil', 'neck'],
    trastes: ['trastes', 'frets'],
    cuerpo: ['cuerpo', 'body', 'back', 'top', 'carved'],
    cuerdas: ['cuerdas', 'strings'],
    microfonos: ['microfono', 'mic', 'pickup', 'pickups', 'micrófono']
  }

  for (const [key, keys] of Object.entries(groups)){
    for (const k of keys){
      if (s.includes(k)) return key
    }
  }

  // secondary detail keywords
  const detailKeys = ['detalle', 'detail', 'close', 'macro', 'zoom', 'closeup']
  for (const k of detailKeys) if (s.includes(k)) return 'detalle'

  return null
}

export default function HeroCarousel({ interval = 5000 }){
  const [items, setItems] = useState([])
  const [index, setIndex] = useState(0)
  const [rotatedMap, setRotatedMap] = useState({})
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  const mounted = useRef(true)
  const timerRef = useRef(null)

  useEffect(() => {
    mounted.current = true
    async function load(){
      setLoading(true)
      try{
        const res = await fetch('/api/products', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        // normalize products like ProductGrid does
        const { default: normalizeProduct } = await import('../lib/utils/normalizeProduct')
        const normalized = Array.isArray(data) ? data.map(d => normalizeProduct(d)) : []

        // For each product, pick a detail image (neck, frets, body, strings, pickups)
        const itemsWithDetail = normalized.map(p => {
          const images = Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : [])
          // classify each image
          const candidates = images.map(src => ({ src, resolved: imageService.resolve(src), cat: classifyImageKeyword(src || '') }))
            .filter(x => x && x.resolved)
          // prefer images that matched one of our target categories
          const matched = candidates.filter(c => ['mastil','trastes','cuerpo','cuerdas','microfonos'].includes(c.cat))
          const picked = pickRandom(matched.length ? matched : candidates)
          return { ...p, _heroImage: picked ? picked.resolved : imageService.resolve(p.image_url || (p.images && p.images[0]) || ''), _heroImageCategory: picked ? picked.cat : (picked === null ? null : null) }
        })

        const five = shuffleArray(itemsWithDetail).slice(0,5)
        if (mounted.current) setItems(five)
      } catch {
        if (mounted.current) setItems([])
      } finally {
        if (mounted.current) setLoading(false)
      }
    }
    load()
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (!items || items.length === 0) return
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % items.length)
    }, interval)
    return () => { clearInterval(timerRef.current) }
  }, [items, interval])

  // Note: portrait images will be rendered as background-image to ensure cover behavior

  function go(n){
    if (!items || items.length === 0) return
    setIndex(() => {
      if (n < 0) return (items.length + n) % items.length
      return n % items.length
    })
    // reset timer
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = setInterval(() => setIndex(i => (i+1)%items.length), interval) }
  }

  if (loading) return null
  if (!items || items.length === 0) return null

  return (
    <section aria-roledescription="carousel" className="w-full overflow-hidden relative">
      <div ref={containerRef} className="w-full h-[58vh] sm:h-[66vh] md:h-[72vh] lg:h-[74vh] relative">
        {items.map((it, i) => {
          const key = it.id || it.slug || i
          const src = it._heroImage || imageService.resolve(it.image_url || (it.images && it.images[0]) || '')
          const isBackground = Boolean(rotatedMap[key] && rotatedMap[key].background)
          const active = i === index
          // compute shortest relative offset (so slides wrap correctly)
          const total = items.length
          let rel = i - index
          if (rel > total / 2) rel -= total
          if (rel < -total / 2) rel += total
          const offset = rel * 100
          const figStyle = {
            transform: `translate3d(${offset}%,0,0)`,
            transition: 'transform 400ms ease-out',
            position: 'absolute',
            inset: 0,
            zIndex: active ? 20 : 10,
            overflow: 'hidden',
            willChange: 'transform, opacity',
            pointerEvents: active ? 'auto' : 'none',
            backfaceVisibility: 'hidden'
          }

          // parallax: small counter-movement of image relative to slide offset
          const imageOffset = -rel * 12 // percent

          return (
            <figure key={key} style={figStyle} aria-hidden={!active}>
              {isBackground ? (
                <div aria-hidden className="absolute inset-0 overflow-hidden">
                  <div className="hero-slide-image absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${src})`, transform: `translate3d(${imageOffset}%,0,0) scale(1.03)` }} />
                </div>
              ) : (
                <div className="absolute inset-0 overflow-hidden" aria-hidden={!active}>
                  <div className="hero-slide-image absolute inset-0" style={{ transform: `translate3d(${imageOffset}%,0,0) scale(1.03)`, willChange: 'transform' }}>
                    <ImageWithSkeleton
                      src={src}
                      alt={it.name || ''}
                      fill
                      quality={80}
                      sizes="(min-width:1024px) 1200px, 100vw"
                      priority={i === 0}
                      className="object-cover"
                      onImageLoad={(meta) => {
                        try{
                          if (!meta || !meta.naturalWidth || !meta.naturalHeight) return
                          const natW = meta.naturalWidth
                          const natH = meta.naturalHeight
                          const isPortrait = natH > natW
                          if (!isPortrait) return
                          // mark this key to render as background on next render
                          setRotatedMap(m => ({ ...(m || {}), [key]: { background: true } }))
                        }catch {/* ignore */}
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
              <figcaption className={`absolute left-4 sm:left-10 lg:left-16 right-4 sm:right-10 lg:right-auto bottom-6 md:bottom-12 lg:bottom-16 w-auto lg:max-w-[44rem] bg-black/34 border border-white/10 backdrop-blur-md rounded-2xl p-5 md:p-7 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] hero-caption ${active ? 'hero-caption--visible' : ''}`}>
                <p className="hero-caption-item hero-caption-item--1 text-[11px] uppercase tracking-[0.22em] text-[#d4a43b] font-medium">
                  {it.brand ? `${it.brand} · Destacado` : 'Instrumento destacado'}
                </p>
                <h2 className="hero-caption-item hero-caption-item--2 mt-2 text-2xl md:text-4xl font-bold leading-[1.1] tracking-tight">{it.name}</h2>
                {it.description ? <p className="hero-caption-item hero-caption-item--3 mt-3 text-sm md:text-base text-white/85 line-clamp-2 md:line-clamp-3 max-w-2xl">{it.description}</p> : null}
                {it.price ? <div className="hero-caption-item hero-caption-item--4 mt-4 text-2xl md:text-3xl font-bold tracking-tight">{it.price}</div> : null}

                {/* Specifications: Modelo · Madera · Micrófonos */}
                {(it.model || it.wood || it.mics) ? (
                  <div className="hero-caption-item hero-caption-item--5 mt-3 text-sm text-white/80 truncate">
                    {[
                      it.model,
                      it.wood,
                      it.mics ? (Array.isArray(it.mics) ? it.mics.join(', ') : it.mics) : null
                    ].filter(Boolean).join(' · ')}
                  </div>
                ) : null}

                <div className="hero-caption-item hero-caption-item--6 mt-5 flex flex-wrap gap-3">
                  <Link href={`/guitars/${it.slug || ''}`} className="btn-info">Ver producto</Link>
                  <Link href="/#seleccion-destacada" className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-xl border border-white/25 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                    Ver catalogo
                  </Link>
                </div>
              </figcaption>
            </figure>
          )
        })}

        {/* controls: ocultos en mobile, visibles desde md */}
        <div className="hidden md:flex absolute left-5 top-1/2 transform -translate-y-1/2 z-30">
          <button
            aria-label="Anterior"
            onClick={() => go(index - 1)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center shadow-sm border border-white/15 hover:bg-black/45 transition-colors"
          >
            <span className="text-xl font-semibold">‹</span>
          </button>
        </div>
        <div className="hidden md:flex absolute right-5 top-1/2 transform -translate-y-1/2 z-30">
          <button
            aria-label="Siguiente"
            onClick={() => go(index + 1)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center shadow-sm border border-white/15 hover:bg-black/45 transition-colors"
          >
            <span className="text-xl font-semibold">›</span>
          </button>
        </div>

        {/* indicators - minimal: thin rounded pills, no background */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 z-30 flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir a diapositiva ${i+1}`}
              aria-current={i===index}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-white/20 ${i===index ? 'w-9 bg-[#d4a43b]' : 'w-4 bg-white/35'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
