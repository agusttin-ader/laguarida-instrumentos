'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import normalizeProduct from '../lib/utils/normalizeProduct'
import imageService from '../lib/utils/imageService'

const HEADLINE = 'Instrumentos que suenan como tienen que sonar'
const SUBHEADLINE = 'Selección real. Sin humo.'
const SLIDE_MS = 5000

/** Marco hero: max ~320px móvil, sm hasta 384px, columna ~44% en lg (max-w-xl / 7xl) */
const HERO_SHOWROOM_IMAGE_SIZES =
  '(max-width: 639px) min(100vw, 384px), (max-width: 1023px) min(92vw, 384px), min(45vw, 600px)'

function isUsableImgUrl(u) {
  if (!u || typeof u !== 'string') return false
  const s = u.trim()
  return s.startsWith('/') || /^https?:\/\//i.test(s)
}

/** URL absoluta para precarga / comprobación en el navegador */
function absoluteImageUrl(url) {
  if (typeof window === 'undefined') return url
  const u = typeof url === 'string' ? url.trim() : ''
  if (!u) return u
  if (u.startsWith('/')) return `${window.location.origin}${u}`
  return u
}

/** Espera a que la imagen esté en caché del browser antes del crossfade */
function preloadHeroImage(url) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }
    const abs = absoluteImageUrl(url)
    if (!abs) {
      reject(new Error('empty url'))
      return
    }
    const img = new window.Image()
    const cleanup = () => {
      img.onload = null
      img.onerror = null
    }
    img.onload = () => {
      cleanup()
      resolve()
    }
    img.onerror = () => {
      cleanup()
      reject(new Error('load failed'))
    }
    img.src = abs
    if (img.complete && img.naturalWidth > 0) {
      cleanup()
      resolve()
    }
  })
}

/**
 * @typedef {{ url: string, name: string, slug: string }} HeroSlide
 */

/** Una imagen por producto, sin repetir URL. */
function collectAllCatalogSlides(rows) {
  /** @type {HeroSlide[]} */
  const out = []
  const seen = new Set()
  for (const raw of rows) {
    const p = normalizeProduct(raw)
    if (!(p.slug || p.id) || !p.name) continue
    const refs = []
    if (p.image_url) refs.push(p.image_url)
    if (Array.isArray(p.images)) refs.push(...p.images)
    for (const ref of refs) {
      const cand = typeof ref === 'string' ? ref.trim() : ''
      if (!cand) continue
      const resolved = imageService.resolve(cand)
      if (resolved && isUsableImgUrl(resolved)) {
        const url = resolved.trim()
        if (seen.has(url)) break
        seen.add(url)
        out.push({
          url,
          name: p.name,
          slug: p.slug ? String(p.slug) : '',
        })
        break
      }
    }
  }
  return out
}

/**
 * Hero “showroom”: imagen del producto en marco editorial (no full-bleed).
 * Rotación del catálogo cada 5s con zoom suave (CSS).
 * @param {{ product?: { name?: string, image_url?: string, category?: string, slug?: string } | null }} props
 */
export default function HeroMarketing({ product = null }) {
  const rawUrl = product?.image_url

  const imageUrl = useMemo(() => {
    if (rawUrl == null) return ''
    if (typeof rawUrl !== 'string') return ''
    return rawUrl.trim()
  }, [rawUrl])

  const usePhoto =
    imageUrl.length > 0 &&
    (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('/'))

  /** @type {[HeroSlide[], (s: HeroSlide[]) => void]} */
  const [slides, setSlides] = useState([])
  const [slideIndex, setSlideIndex] = useState(0)
  const [slidesReady, setSlidesReady] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  /** Doble capa para crossfade entre fotos */
  /** @type {[HeroSlide[] | null, (s: HeroSlide[] | null) => void]} */
  const [layerSlots, setLayerSlots] = useState(/** @type {HeroSlide[] | null} */ (null))
  const [topLayer, setTopLayer] = useState(0)
  const galleryInitRef = useRef(false)
  const topLayerRef = useRef(0)
  const prevSlideIndexRef = useRef(0)
  const transitionGenRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let cancelled = false

    const serverSlide =
      usePhoto && imageUrl
        ? {
            url: imageUrl,
            name: (product?.name && String(product.name).trim()) || '',
            slug: (product?.slug && String(product.slug).trim()) || '',
          }
        : null

    galleryInitRef.current = false
    if (serverSlide) {
      setSlides([serverSlide])
      setSlideIndex(0)
    } else {
      setSlides([])
      setSlideIndex(0)
    }
    setSlidesReady(false)

    ;(async () => {
      try {
        const res = await fetch('/api/products', { cache: 'default' })
        if (!res.ok || cancelled) {
          if (!cancelled) setSlidesReady(true)
          return
        }
        const data = await res.json()
        if (!Array.isArray(data) || cancelled) return

        let list = collectAllCatalogSlides(data)
        if (serverSlide) {
          list = [serverSlide, ...list.filter((s) => s.url !== serverSlide.url)]
        }

        if (!cancelled) {
          galleryInitRef.current = false
          setSlides(list.length ? list : serverSlide ? [serverSlide] : [])
          setSlideIndex(0)
          setSlidesReady(true)
        }
      } catch {
        if (!cancelled) {
          galleryInitRef.current = false
          setSlides(serverSlide ? [serverSlide] : [])
          setSlideIndex(0)
          setSlidesReady(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [usePhoto, imageUrl, rawUrl, product?.name, product?.slug])

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [slides, reduceMotion])

  useLayoutEffect(() => {
    if (!slides.length) {
      setLayerSlots(null)
      galleryInitRef.current = false
      prevSlideIndexRef.current = 0
      transitionGenRef.current += 1
      return
    }

    if (!galleryInitRef.current) {
      galleryInitRef.current = true
      const s0 = slides[Math.min(slideIndex, slides.length - 1)] ?? slides[0]
      setLayerSlots([s0, s0])
      topLayerRef.current = 0
      setTopLayer(0)
      prevSlideIndexRef.current = slideIndex
    }
  }, [slides, slideIndex])

  useEffect(() => {
    if (!slides.length || !galleryInitRef.current || !layerSlots) return
    if (slideIndex === prevSlideIndexRef.current) return

    const inactive = 1 - topLayerRef.current
    const nextSlide = slides[slideIndex]
    if (!nextSlide?.url) return

    prevSlideIndexRef.current = slideIndex
    const gen = ++transitionGenRef.current

    setLayerSlots((prev) => {
      if (!prev) return prev
      const n = [...prev]
      n[inactive] = nextSlide
      return n
    })

    preloadHeroImage(nextSlide.url)
      .then(() => {
        if (gen !== transitionGenRef.current) return
        requestAnimationFrame(() => {
          topLayerRef.current = inactive
          setTopLayer(inactive)
        })
      })
      .catch(() => {
        if (gen !== transitionGenRef.current) return
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Hero] No se pudo precargar la imagen:', nextSlide.url)
        }
        requestAnimationFrame(() => {
          topLayerRef.current = inactive
          setTopLayer(inactive)
        })
      })
  }, [slideIndex, slides, layerSlots])

  /** Pie de foto / CTA alineados con la capa visible (evita texto nuevo + foto vieja mientras precarga). */
  const visualSlide = useMemo(() => {
    if (!layerSlots) return slides[slideIndex] ?? slides[0]
    return layerSlots[topLayer] ?? slides[slideIndex] ?? slides[0]
  }, [layerSlots, topLayer, slides, slideIndex])

  const current = slides[slideIndex] ?? slides[0]
  const showFrameImage = Boolean(current?.url) && Boolean(layerSlots?.[0]?.url)

  const displayName = (visualSlide?.name && String(visualSlide.name).trim()) || ''

  const productHref = useMemo(() => {
    const cs = visualSlide?.slug && String(visualSlide.slug).trim()
    if (cs) return `/guitars/${encodeURIComponent(cs)}`
    return null
  }, [visualSlide])

  useEffect(() => {
    if (!slides.length || slides.length <= 1) return
    const nextIdx = (slideIndex + 1) % slides.length
    const u = slides[nextIdx]?.url
    if (u) preloadHeroImage(u).catch(() => {})
  }, [slideIndex, slides])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    console.log('[Hero] slide', slideIndex + 1, '/', slides.length, current?.url ?? '(sin url)')

    if (!showFrameImage || !current?.url) return
    const u = current.url
    const absoluteForProbe =
      u.startsWith('/') && typeof window !== 'undefined'
        ? `${window.location.origin}${u}`
        : u
    const probe = new window.Image()
    probe.onload = () => {}
    probe.onerror = () =>
      console.warn('[Hero] imagen no cargó (URL, bucket o red).')
    probe.src = absoluteForProbe
  }, [slideIndex, slides.length, current?.url, showFrameImage])

  const kicker =
    product?.category && String(product.category).trim()
      ? String(product.category).trim()
      : 'Selección destacada'

  const showLoading = !slidesReady && !usePhoto

  function scrollToCatalog(e) {
    if (typeof document === 'undefined') return
    const el = document.getElementById('seleccion-destacada')
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-[var(--dark-bg-page)]">
      {/* Luz ambiente + grain: una capa + pseudo (ver .hero-showroom-ambient en globals.css) */}
      <div className="hero-showroom-ambient" aria-hidden />

      <div className="relative z-[1] mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col gap-11 px-5 pb-16 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:gap-12 sm:px-8 sm:pb-20 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:pb-24 lg:pt-[calc(3.75rem+env(safe-area-inset-top,0px))] xl:px-12">
        {/* Marco + foto (arriba en móvil) */}
        <div className="order-1 flex w-full justify-center lg:order-2 lg:w-[44%] lg:max-w-xl lg:flex-shrink-0 lg:justify-end">
          <figure className="hero-showroom-frame relative w-full max-w-[min(100%,320px)] sm:max-w-sm lg:max-w-none">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#121212] shadow-[0_24px_60px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
              {showFrameImage && layerSlots ? (
                <>
                  {layerSlots.map((slot, i) => (
                    <div
                      key={i}
                      className={`hero-showroom-slide-layer ${
                        i === topLayer
                          ? 'hero-showroom-slide-layer--in'
                          : 'hero-showroom-slide-layer--out'
                      }`}
                      aria-hidden={i !== topLayer}
                    >
                      <div
                        className={
                          i === topLayer && !reduceMotion
                            ? 'hero-showroom-photo-kenburns relative h-full w-full'
                            : 'relative h-full w-full'
                        }
                        key={slot.url}
                      >
                        <Image
                          src={slot.url}
                          alt={slot.name || 'Instrumento del catálogo'}
                          fill
                          sizes={HERO_SHOWROOM_IMAGE_SIZES}
                          quality={85}
                          priority={slideIndex === 0 && i === topLayer}
                          fetchPriority={slideIndex === 0 && i === topLayer ? 'high' : 'low'}
                          decoding="async"
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#252a35] via-[#1a1d24] to-[#14161c] px-6 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--vintage-gold)]/55">
                    La Guarida
                  </span>
                  {showLoading ? (
                    <p className="text-sm leading-snug text-white/45">Cargando fotos del catálogo…</p>
                  ) : (
                    <p className="text-sm leading-snug text-white/45">
                      Todavía no hay imágenes en el catálogo para mostrar acá.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div
              className="pointer-events-none absolute -inset-px rounded-[1.05rem] ring-1 ring-[var(--vintage-gold)]/25"
              aria-hidden
            />
            <figcaption className="hero-showroom-caption-fade mt-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--dark-muted)] lg:text-left">
              {displayName ? (
                <span className="text-white/70" key={visualSlide?.url ?? slideIndex}>
                  {displayName}
                </span>
              ) : (
                <span>Destacado del día</span>
              )}
            </figcaption>
          </figure>
        </div>

        {/* Copy */}
        <div className="order-2 flex flex-1 flex-col justify-center text-center lg:order-1 lg:max-w-xl lg:text-left">
          <div className="hero-showroom-content">
            <p className="mb-4 inline-flex flex-col items-center gap-2 sm:mb-5 lg:items-start">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--vintage-gold)] sm:text-xs">
                {kicker}
              </span>
              <span
                className="hidden h-px w-12 bg-gradient-to-r from-[var(--vintage-gold)] to-transparent sm:block lg:mx-0"
                aria-hidden
              />
            </p>
            <h1
              id="home-hero"
              className="font-display text-[1.85rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.25rem] md:text-[2.6rem] lg:text-[2.85rem]"
            >
              {HEADLINE}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--dark-muted)] sm:mt-5 sm:text-lg lg:mx-0">
              {SUBHEADLINE}
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Link
                href="/#seleccion-destacada"
                onClick={scrollToCatalog}
                className="no-custom-btn inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--dark-cta-bg)] px-7 py-3 text-[15px] font-semibold text-[var(--dark-cta-text)] shadow-[0_1px_0_rgba(255,255,255,0.14)_inset] transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-[var(--dark-cta-hover)] hover:shadow-[0_14px_32px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]"
              >
                Ver catálogo
              </Link>
              {productHref ? (
                <Link
                  href={productHref}
                  className="no-custom-btn inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/14 bg-white/[0.03] px-7 py-3 text-[15px] font-semibold text-white/90 backdrop-blur-sm transition-[transform,background-color,border-color] duration-200 hover:border-[var(--vintage-gold)]/35 hover:bg-white/[0.06] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]"
                >
                  Ver esta pieza
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
