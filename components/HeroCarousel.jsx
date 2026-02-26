"use client"
import React, { useEffect, useState, useRef } from 'react'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'
import Link from 'next/link'

function shuffleArray(a){
  const arr = [...a]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

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

function humanLabel(cat){
  if (!cat) return ''
  const map = { mastil: 'Mástil', trastes: 'Trastes', cuerpo: 'Cuerpo', cuerdas: 'Cuerdas', microfonos: 'Micrófonos', detalle: 'Detalle' }
  return map[cat] || cat
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
      } catch (e){
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
      <div ref={containerRef} className="w-full h-[60vh] sm:h-[68vh] md:h-[72vh] lg:h-[72vh] relative">
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
            transition: 'transform 700ms cubic-bezier(.2,.9,.2,1)',
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
                        }catch(e){/* ignore */}
                      }}
                    />
                  </div>
                </div>
              )}
              <figcaption className={`absolute left-6 sm:left-20 lg:left-24 right-6 sm:right-16 lg:right-24 bottom-8 md:bottom-16 lg:bottom-20 max-w-3xl bg-black/36 backdrop-blur-sm rounded-xl p-6 md:p-8 text-white hero-caption ${active ? 'hero-caption--visible' : ''}`}>
                <h2 className="text-2xl md:text-4xl font-bold leading-tight">{it.name}</h2>
                {it.description ? <p className="mt-2 text-sm md:text-base text-white/90 line-clamp-3">{it.description}</p> : null}
                {it.price ? <div className="mt-4 text-xl font-semibold">{it.price}</div> : null}

                {/* Specifications: Modelo · Madera · Micrófonos */}
                {(it.model || it.wood || it.mics) ? (
                  <div className="mt-3 text-sm text-white/80 truncate">
                    {[
                      it.model,
                      it.wood,
                      it.mics ? (Array.isArray(it.mics) ? it.mics.join(', ') : it.mics) : null
                    ].filter(Boolean).join(' · ')}
                  </div>
                ) : null}

                {/* image detail label removed as requested */}
                <div className="mt-4 flex gap-3">
                  <Link href={`/guitars/${it.slug || ''}`} className="btn-info">Ver producto</Link>
                </div>
              </figcaption>
            </figure>
          )
        })}

        {/* controls */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30">
          <button
            aria-label="Anterior"
            onClick={() => go(index - 1)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center shadow-sm border border-white/10 hover:bg-black/40 transition-colors"
          >
            <span className="text-xl font-semibold">‹</span>
          </button>
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30">
          <button
            aria-label="Siguiente"
            onClick={() => go(index + 1)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center shadow-sm border border-white/10 hover:bg-black/40 transition-colors"
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
              className={`h-1 rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-white/20 ${i===index ? 'w-8 bg-white' : 'w-4 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
