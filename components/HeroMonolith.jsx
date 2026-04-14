"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ImageWithSkeleton from './ImageWithSkeleton'
import imageService from '../lib/utils/imageService'
import { useProducts } from '../hooks/useProducts'
import { useToast } from './ToastContext'
import { useHomeHeroImage } from '../context/HomeHeroImageContext'

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
      className="no-custom-btn inline-flex items-center justify-center min-h-[40px] sm:min-h-[44px] w-10 sm:w-12 px-0 rounded-xl border border-[var(--vintage-gold)]/50 bg-[var(--vintage-gold-soft)] text-[#f3d399] text-sm font-semibold transition-colors duration-200 ease-out hover:bg-[var(--vintage-gold-soft-hover)] active:opacity-95 shrink-0"
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
  const key = dayKey != null && dayKey !== '' ? dayKey : new Date().toDateString()
  const idx = hashString(key) % pool.length
  return pool[idx]
}

export default function HeroMonolith() {
  const { products, loading } = useProducts({ shuffleCatalog: false })
  const [hasMounted, setHasMounted] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [initialHeroReady, setInitialHeroReady] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const item = useMemo(() => {
    if (!hasMounted || !products.length) return null
    const dayKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
    return pickFeatured(products, dayKey)
  }, [products, hasMounted])

  const imageSrc = useMemo(() => imageService.resolve(item?.image_url || (item?.images && item.images[0]) || ''), [item])
  const heroSlides = useMemo(() => {
    if (!hasMounted || !products.length) return []
    const unique = new Set()
    const candidates = products
      .filter((p) => (p.image_url || (p.images && p.images[0])) && p.name)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        model: p.model,
        wood: p.wood,
        mics: p.mics,
        src: imageService.resolve(p.image_url || (p.images && p.images[0]) || ''),
      }))
      .filter((p) => p.src && !unique.has(p.src) && unique.add(p.src))
    return candidates
  }, [products, hasMounted])
  const slides = heroSlides.length ? heroSlides : [{
    id: item?.id,
    slug: item?.slug,
    name: item?.name || 'Producto destacado',
    description: item?.description,
    price: item?.price,
    model: item?.model,
    wood: item?.wood,
    mics: item?.mics,
    src: imageSrc,
  }]
  const activeItem = slides[activeSlide] || slides[0] || null
  const activeImageSrc = activeItem?.src || imageSrc
  const specs = useMemo(() => [activeItem?.model, activeItem?.wood, activeItem?.mics].filter(Boolean).slice(0, 3), [activeItem])
  const specLine = useMemo(() => specs.map((s) => (Array.isArray(s) ? s.join(', ') : s)).join(' · '), [specs])
  const dataReady = Boolean(
    hasMounted &&
    !loading &&
    item &&
    String(imageSrc || '').trim() &&
    activeItem &&
    String(activeImageSrc || '').trim()
  )
  const blockHero = !dataReady
  const shouldShowLoader = dataReady && !initialHeroReady

  useEffect(() => {
    if (slides.length <= 1 || typeof window === 'undefined') return
    const next = slides[(activeSlide + 1) % slides.length]
    if (!next?.src) return
    const img = new window.Image()
    img.decoding = 'async'
    img.src = next.src
  }, [activeSlide, slides])

  const { setHeroImageUrl } = useHomeHeroImage()
  useEffect(() => {
    if (activeImageSrc) setHeroImageUrl(activeImageSrc)
    return () => setHeroImageUrl(null)
  }, [activeImageSrc, setHeroImageUrl])

  useEffect(() => {
    setActiveSlide(0)
  }, [heroSlides.length])

  useEffect(() => {
    if (heroSlides.length <= 1 || isPaused) return undefined
    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [heroSlides.length, isPaused])

  if (blockHero) {
    return (
      <section aria-labelledby="home-hero" className="relative w-full overflow-hidden">
        <article className="relative w-full min-h-[100vh] min-h-[100dvh] bg-[var(--dark-bg-page)]">
          <div className="hero-home-loader">
            <div className="hero-home-loader__spinner" aria-hidden />
            {/* <img> evita diferencias SSR/cliente de next/image en el loader */}
            <img
              src="/images/logo/logo-fondo-oscuro.PNG"
              alt="La Guarida"
              width={190}
              height={68}
              className="hero-home-loader__brand"
              decoding="async"
              fetchPriority="high"
            />
            <p className="sr-only">Cargando catálogo destacado</p>
          </div>
        </article>
      </section>
    )
  }
  const prevIndex = slides.length > 1 ? (activeSlide - 1 + slides.length) % slides.length : 0
  const nextIndex = slides.length > 1 ? (activeSlide + 1) % slides.length : 0
  return (
    <section aria-labelledby="home-hero" className="relative w-full overflow-hidden">
      {shouldShowLoader ? (
        <div className="hero-home-loader hero-home-loader--overlay" aria-hidden>
          <div className="hero-home-loader__spinner" />
          <img
            src="/images/logo/logo-fondo-oscuro.PNG"
            alt=""
            width={160}
            height={58}
            className="hero-home-loader__brand"
            decoding="async"
          />
        </div>
      ) : null}
      {/* ——— Mobile: imagen desde borde superior (header fijo por encima), article con pt para el texto ——— */}
      <div className="md:hidden">
        <article
          className="hero-mobile-editorial relative w-full min-h-[100vh] min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-[calc(58px+max(0.25rem,env(safe-area-inset-top)))] sm:pt-[calc(62px+max(0.25rem,env(safe-area-inset-top)))]"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
        {/* Imagen de fondo: inset-0 para que llene todo el article (incl. zona del header) */}
        <div className="absolute inset-0 hero-mobile-editorial-bg">
          {slides.map((slide, index) => {
            const shouldRender = index === activeSlide || index === prevIndex || index === nextIndex
            if (!shouldRender) return null
            return (
            <div
              key={`mobile-slide-${slide.src}-${index}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${index === activeSlide ? 'opacity-100' : 'opacity-0'} hero-slide-layer`}
              aria-hidden={index !== activeSlide}
            >
              <ImageWithSkeleton
                src={slide.src}
                alt={slide.name || 'Producto destacado'}
                fill
                quality={82}
                sizes="100vw"
                  className={`object-cover object-[center_22%] hero-slide-image ${index === activeSlide ? 'hero-slide-image-active hero-slide-image-mobile-active hero-mobile-image-polish-active' : 'hero-mobile-image-polish'}`}
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                disableClientPreview
                onImageLoad={() => {
                    if (index === activeSlide && !initialHeroReady) setInitialHeroReady(true)
                }}
              />
            </div>
          )})}
          {/* Overlays suaves para evitar "barras" sólidas arriba/abajo */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.05) 30%, transparent 62%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 36%, transparent 74%)' }} />
        </div>
        {/* Contenido superpuesto abajo: destacado, título, precio y CTAs */}
        <div key={`hero-mobile-copy-${activeSlide}`} className="hero-mobile-caption hero-mobile-caption-surface hero-copy-swap relative z-10 px-4 sm:px-5 pb-10 sm:pb-10 pt-16">
          <p className="hero-mobile-badge hero-mobile-text-shadow text-[10px] max-[360px]:text-[9px] uppercase tracking-[0.2em] text-white font-semibold mb-2">
            Destacado
          </p>
          <h1 id="home-hero" className="hero-mobile-text-shadow text-[2rem] sm:text-[2.25rem] font-bold leading-[1.08] text-white tracking-tight">
            {activeItem.name}
          </h1>
          {activeItem.price ? (
            <p className="hero-mobile-text-shadow mt-2 text-[1.125rem] font-semibold text-[var(--vintage-gold)]">{activeItem.price}</p>
          ) : null}
          <div className="mt-6 max-[360px]:mt-5 flex flex-col gap-3 max-[360px]:gap-2.5">
            <Link
              href={`/guitars/${activeItem.slug || activeItem.id || ''}`}
              className="hero-mobile-cta no-custom-btn flex items-center justify-center min-h-[50px] max-[360px]:min-h-[46px] w-full rounded-full font-bold text-[15px] max-[360px]:text-[14px] active:opacity-95 transition-opacity touch-manipulation"
              style={{ backgroundColor: '#ffffff', color: '#0f0f12' }}
            >
              Ver detalles
            </Link>
            <Link
              href="/#seleccion-destacada"
              className="hero-mobile-text-shadow no-custom-btn text-center text-[14px] max-[360px]:text-[13px] text-white font-medium underline underline-offset-2 decoration-white/80"
            >
              Ver selección destacada →
            </Link>
          </div>
        </div>
      </article>
      </div>

      {/* ——— Desktop: hero editorial (imagen cover + panel de texto, sin marco) ——— */}
      <article
        className="hidden md:block relative w-full bg-[var(--dark-bg-page)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        <div className="hero-editorial-split grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:min-h-[min(88vh,920px)] xl:min-h-[min(90vh,980px)]">
          <div className="relative min-h-[52vh] lg:min-h-full min-w-0 overflow-hidden">
            <div className="absolute inset-0">
              {slides.map((slide, index) => {
                const shouldRender = index === activeSlide || index === prevIndex || index === nextIndex
                if (!shouldRender) return null
                return (
                  <div
                    key={`desktop-slide-${slide.src}-${index}`}
                    className={`absolute inset-0 transition-opacity duration-700 ease-out ${index === activeSlide ? 'opacity-100' : 'opacity-0'} hero-slide-layer`}
                    aria-hidden={index !== activeSlide}
                  >
                    <ImageWithSkeleton
                      src={slide.src}
                      alt={slide.name || 'Producto destacado'}
                      fill
                      quality={88}
                      sizes="(min-width:1024px) 50vw, 100vw"
                      className={`object-cover object-center hero-slide-image ${index === activeSlide ? 'hero-slide-image-active' : ''}`}
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      disableClientPreview
                      onImageLoad={() => {
                        if (index === activeSlide && !initialHeroReady) setInitialHeroReady(true)
                      }}
                    />
                  </div>
                )
              })}
            </div>
            {/* Degradados: apilado (tablet) y transición hacia la columna de texto (desktop) */}
            <div
              className="pointer-events-none absolute inset-0 z-[1] lg:hidden bg-gradient-to-t from-[var(--dark-bg-page)] via-black/25 to-black/35"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] hidden lg:block bg-gradient-to-r from-black/15 via-transparent to-[var(--dark-bg-page)]"
              aria-hidden
            />
          </div>

          <div className="relative z-[2] flex flex-col justify-center px-8 md:px-10 lg:px-12 xl:px-14 py-12 lg:py-16 border-t border-white/10 lg:border-t-0 lg:border-l lg:border-white/10 bg-[var(--dark-bg-page)] min-w-0">
            <div key={`hero-desktop-copy-${activeSlide}`} className="hero-copy-swap w-full max-w-[540px]">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--vintage-gold)]/90 font-semibold mb-3">Selección de hoy</p>
              <h1 id="home-hero" className="text-[2rem] lg:text-[2.35rem] xl:text-[2.75rem] font-bold leading-[1.05] tracking-tight text-white">
                {activeItem.name}
              </h1>
              {activeItem.price ? (
                <p className="mt-4 text-[1.25rem] lg:text-[1.45rem] font-semibold text-[var(--vintage-gold)]">{activeItem.price}</p>
              ) : null}
              {specs.length > 0 ? (
                <p className="mt-3 text-sm text-white/68 leading-snug">{specLine}</p>
              ) : null}
              {activeItem.description ? (
                <p className="mt-5 text-[0.9375rem] text-white/75 leading-relaxed line-clamp-4">
                  {activeItem.description}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/guitars/${activeItem.slug || activeItem.id || ''}`} className="hero-cta-primary no-custom-btn inline-flex items-center justify-center min-h-[44px] py-2.5 px-5 rounded-xl border-2 border-[var(--vintage-gold)] bg-[var(--vintage-gold-soft)] text-[var(--vintage-gold)] text-[13px] font-bold transition-colors duration-200 ease-out hover:bg-[var(--vintage-gold-soft-hover)] hover:border-[var(--vintage-gold)] active:opacity-95">
                  Ver detalles
                </Link>
                <Link href="/#seleccion-destacada" className="no-custom-btn inline-flex items-center justify-center min-h-[44px] py-2.5 px-5 rounded-xl border border-white/22 bg-white/[0.06] text-white/90 text-[13px] font-medium transition-colors duration-200 ease-out hover:bg-white/12 hover:border-white/32 active:opacity-95">
                  Ver selección destacada →
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
