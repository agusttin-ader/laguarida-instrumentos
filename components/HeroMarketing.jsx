'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CaretDown } from 'phosphor-react'
import { useEffect, useMemo, useState } from 'react'

const HERO_PRIMARY_DESKTOP = '/images/hero5-desktop.jpg'
const HERO_PRIMARY_MOBILE = '/images/hero5-mobile.jpg'
const HERO_FALLBACK = '/images/hero.PNG'

const HEADLINE = 'Tu refugio del buen sonido'
const SUBHEADLINE = 'Instrumentos con historia y trato cercano.'
const MOBILE_HEADLINE = 'Tu refugio del buen sonido'
const MOBILE_SUBHEADLINE = 'Instrumentos con historia y trato cercano.'

export default function HeroMarketing({ product = null }) {
  const [heroSrc, setHeroSrc] = useState(HERO_PRIMARY_DESKTOP)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const syncSrc = () => setHeroSrc(mq.matches ? HERO_PRIMARY_MOBILE : HERO_PRIMARY_DESKTOP)
    syncSrc()
    mq.addEventListener('change', syncSrc)
    return () => mq.removeEventListener('change', syncSrc)
  }, [])

  const kicker =
    product?.category && String(product.category).trim()
      ? String(product.category).trim()
      : 'La Guarida'

  const productHref = useMemo(() => {
    const slug = product?.slug && String(product.slug).trim()
    if (slug) return `/guitars/${encodeURIComponent(slug)}`
    return null
  }, [product?.slug])

  function scrollToCatalog(e) {
    if (typeof document === 'undefined') return
    const el = document.getElementById('seleccion-destacada')
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      className="hero-home relative isolate min-h-[100dvh] w-full max-md:min-h-0 overflow-hidden bg-[#0a0a0a]"
      style={{
        backgroundImage: `url(${heroSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 42%',
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          key={heroSrc}
          src={heroSrc}
          alt="La Guarida — instrumentos"
          fill
          priority
          fetchPriority="high"
          quality={64}
          sizes="100vw"
          unoptimized
          className="object-cover object-[center_42%] md:object-center"
          onError={() =>
            setHeroSrc((prev) => (prev === HERO_FALLBACK ? prev : HERO_FALLBACK))
          }
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
        style={{
          background: `
            radial-gradient(ellipse 90% 75% at 18% 48%, rgba(0,0,0,0.58) 0%, transparent 58%),
            linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 45%, rgba(0,0,0,0.35) 100%)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] md:hidden"
        style={{
          background:
            'radial-gradient(ellipse 100% 70% at 50% 42%, rgba(0,0,0,0.45) 0%, transparent 55%), linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 45%), linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 35%)',
        }}
        aria-hidden
      />

      <div className="relative z-[2] flex min-h-[100dvh] w-full flex-col justify-center px-5 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(6.5rem,env(safe-area-inset-bottom,0px))] md:min-h-[100dvh] md:px-[8%] md:pb-16 md:pt-8">
        <div className="mx-auto w-full max-w-md text-center md:mx-0 md:max-w-[min(100%,28rem)] md:text-left sm:max-w-[min(100%,32rem)] lg:max-w-xl">
          <p className="mb-4 flex flex-col items-center gap-3 md:items-start">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--vintage-gold)] sm:text-xs">
              {kicker}
            </span>
            <span className="h-px w-10 max-md:mx-auto bg-[var(--vintage-gold)]/90 md:self-start" aria-hidden />
          </p>
          <h1
            id="home-hero"
            className="font-display text-[1.85rem] font-bold leading-[1.1] tracking-tight text-[var(--dark-text-primary)] drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] max-md:mx-auto max-md:max-w-[17ch] sm:text-[2.25rem] md:mx-0 md:max-w-none md:text-[2.6rem] lg:text-[2.85rem] xl:text-5xl 2xl:text-6xl min-[1920px]:text-[3.5rem] min-[1920px]:leading-[1.06] min-[2560px]:text-[4rem]"
          >
            <span className="hidden md:block">{HEADLINE}</span>
            <span className="inline text-[clamp(1.45rem,5.5vw,1.85rem)] leading-[1.14] md:hidden">
              {MOBILE_HEADLINE}
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--dark-muted)] [text-shadow:0_1px_14px_rgba(0,0,0,0.5)] max-md:mx-auto max-md:mt-3 max-md:max-w-[28ch] sm:mt-5 sm:text-lg md:mx-0 md:max-w-xl xl:max-w-2xl xl:text-xl 2xl:text-2xl 2xl:leading-snug">
            <span className="hidden md:block">{SUBHEADLINE}</span>
            <span className="inline text-[15px] leading-relaxed text-white/90 md:hidden">
              {MOBILE_SUBHEADLINE}
            </span>
          </p>
          {productHref ? (
            <div className="mt-7 flex w-full max-w-md max-md:mx-auto sm:mt-9 md:mx-0 md:mt-9">
              <Link
                href={productHref}
                className="no-custom-btn inline-flex min-h-[48px] w-full shrink-0 items-center justify-center rounded-3xl border border-white/18 bg-white/[0.06] px-7 py-3 text-[15px] font-semibold text-white transition-[transform,background-color,border-color] duration-200 hover:border-[var(--vintage-gold)]/40 hover:bg-white/[0.1] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 max-md:max-w-sm max-md:self-center md:w-auto"
              >
                Ver esta pieza
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <Link
        href="/#seleccion-destacada"
        onClick={scrollToCatalog}
        className="hero-scroll-hint no-custom-btn absolute left-1/2 z-[3] grid max-w-[calc(100vw-2rem)] -translate-x-1/2 grid-cols-1 justify-items-center gap-2 text-white transition-opacity duration-200 hover:opacity-95 active:opacity-85 max-md:bottom-[max(5.5rem,env(safe-area-inset-bottom,0px))] md:bottom-10"
        aria-label="Ir al catálogo"
      >
        <span className="col-span-1 text-center text-[13px] font-medium uppercase leading-none tracking-[0.3em] [text-shadow:0_1px_14px_rgba(0,0,0,0.75),0_0_1px_rgba(0,0,0,0.8)] [padding-inline:0.15em] sm:text-[14px] md:text-[15px] md:tracking-[0.28em]">
          Catálogo
        </span>
        <span className="hero-scroll-hint__chevron col-span-1 flex w-full justify-center text-white">
          <CaretDown
            className="relative left-[0.5px] h-6 w-6 opacity-90 [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.65))]"
            weight="regular"
            aria-hidden
          />
        </span>
      </Link>
    </div>
  )
}
