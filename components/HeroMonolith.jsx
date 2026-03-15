"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'
import { useProducts } from '../hooks/useProducts'
import { useToast } from './ToastContext'

const WA_HREF = 'https://wa.me/5491154661749?text=' + encodeURIComponent('Hola, me interesa La Guarida, me podrias dar informacion?')

function WhatsAppHeroButton() {
  const { toast } = useToast()
  function handleClick(e) {
    e.preventDefault()
    toast('Abriendo WhatsApp…', 'default')
    window.open(WA_HREF, '_blank', 'noopener,noreferrer')
  }
  return (
    <a
      href={WA_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      onClick={handleClick}
      className="no-custom-btn inline-flex items-center justify-center min-h-[40px] sm:min-h-[44px] w-10 sm:w-12 px-0 rounded-xl border border-[var(--vintage-gold)]/50 bg-[var(--vintage-gold-soft)] text-[#f3d399] text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--vintage-gold-soft-hover)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(201,162,39,0.28)] active:translate-y-0 shrink-0"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
      </svg>
    </a>
  )
}

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
    <section aria-labelledby="home-hero" className="w-full overflow-hidden">
      {/* ——— Mobile v6: imagen full bleed + tipo grande debajo ——— */}
      <article className="md:hidden w-full bg-[#0a0b0e]">
        <div className="relative w-full" style={{ height: 'clamp(260px, 48vh, 380px)' }}>
          <ImageWithSkeleton
            src={imageSrc}
            alt={item.name || 'Producto destacado'}
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
            priority
            disableClientPreview
          />
        </div>
        <div className="px-4 sm:px-5 pt-5 pb-6 sm:pt-6 sm:pb-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--vintage-gold)] font-semibold mb-2">Destacado</p>
          <h1 id="home-hero" className="text-[1.625rem] sm:text-[1.75rem] font-bold leading-tight text-white tracking-tight">
            {item.name}
          </h1>
          {item.price && (
            <p className="mt-2 text-[1.0625rem] sm:text-[1.125rem] font-semibold text-white/80">{item.price}</p>
          )}
          <Link
            href={`/guitars/${item.slug || item.id || ''}`}
            className="no-custom-btn mt-5 sm:mt-6 flex items-center justify-center min-h-[48px] w-full rounded-xl bg-[var(--vintage-gold-soft)] text-[#1a1b20] font-bold text-[15px] border border-[var(--vintage-gold)]/50 active:scale-[0.98] transition-transform touch-manipulation"
          >
            Ver producto
          </Link>
          <Link
            href="/#seleccion-destacada"
            className="no-custom-btn mt-3 sm:mt-4 block text-center text-[13px] text-white/60 font-medium py-2 -mb-2"
          >
            Ver selección destacada
          </Link>
        </div>
      </article>

      {/* ——— Desktop: 100% width split ——— */}
      <article className="hidden md:block relative w-full min-h-[60vh] lg:min-h-[65vh] bg-[#323232]">
        {/* Ambient orbs: flotación suave */}
        <div className="hero-orb-float pointer-events-none absolute left-0 top-1/3 h-80 w-80 rounded-full bg-[var(--vintage-gold)]/10 blur-[100px]" aria-hidden />
        <div className="hero-orb-float pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[var(--vintage-gold)]/5 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] min-h-[60vh] lg:min-h-[65vh]">
          {/* Image: full width of left column, diagonal right edge */}
          <div className="relative min-h-[45vh] lg:min-h-full hero-image-entrance hero-desktop-image-cut">
            <ImageWithSkeleton
              src={imageSrc}
              alt={item.name || 'Producto destacado'}
              fill
              quality={100}
              sizes="(min-width:1024px) 60vw, 100vw"
              className="object-cover"
              priority
              disableClientPreview
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Content panel: right, diagonal left edge to match image cut */}
          <div className="hero-panel-entrance relative z-10 flex flex-col justify-center px-8 lg:px-12 xl:px-16 py-12 lg:py-16 hero-desktop-panel-cut bg-gradient-to-b from-[#3d3d3d]/98 to-[#323232]/98">
            <div className="hero-entrance flex flex-col max-w-lg">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--vintage-gold)]/90 font-medium mb-3" aria-hidden>La Guarida</p>
              <div className="rounded-full border border-[var(--vintage-gold)]/40 bg-black/20 backdrop-blur-sm w-fit px-3 py-1.5 mb-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--vintage-gold)] font-semibold">Producto destacado</span>
              </div>
              <h1 id="home-hero" className="text-2xl lg:text-[2.5rem] xl:text-[2.85rem] font-bold leading-[1.06] tracking-tight text-white">
                {item.name}
              </h1>
              {item.description ? (
                <p className="mt-4 text-sm lg:text-base text-white/78 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              ) : <div aria-hidden />}
              {item.price ? (
                <p className="mt-5 text-xl lg:text-2xl font-bold tracking-tight text-white">{item.price}</p>
              ) : <div aria-hidden />}
              {specs.length > 0 ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Specs</p>
                  <p className="mt-0.5 text-sm text-white/88 leading-snug">{specLine}</p>
                </div>
              ) : <div aria-hidden />}
              <div className="mt-6 lg:mt-7 flex flex-wrap gap-2 sm:gap-2.5">
                <Link href={`/guitars/${item.slug || item.id || ''}`} className="hero-cta-primary no-custom-btn inline-flex items-center justify-center min-h-[40px] sm:min-h-[44px] py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl border-2 border-[var(--vintage-gold)] bg-[var(--vintage-gold-soft)] text-[var(--vintage-gold)] text-[12px] sm:text-[13px] font-bold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--vintage-gold-soft-hover)] hover:border-[var(--vintage-gold)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(201,162,39,0.25)] active:translate-y-0 min-w-[120px] sm:min-w-0">
                  Ver detalles
                </Link>
                <Link href="/#seleccion-destacada" className="no-custom-btn inline-flex items-center justify-center min-h-[40px] sm:min-h-[44px] py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl border border-white/25 bg-white/5 text-white/90 text-[12px] sm:text-[13px] font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/12 hover:border-white/35 hover:-translate-y-0.5 active:translate-y-0 min-w-[100px] sm:min-w-0">
                  Ver selección destacada
                </Link>
                <WhatsAppHeroButton />
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
