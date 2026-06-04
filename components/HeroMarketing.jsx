'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const HERO_PRIMARY_DESKTOP = '/images/optimized/hero5-desktop-pil.jpg'
const HERO_PRIMARY_MOBILE = '/images/optimized/hero5-mobile-pil.jpg'
const HERO_FALLBACK = '/images/optimized/hero5-mobile-pil.jpg'
const MOBILE_QUERY = '(max-width: 767px)'

const HEADLINE = 'Tu refugio del buen sonido'
const SUBHEADLINE = 'Instrumentos con historia y trato cercano.'
const MOBILE_HEADLINE = 'Tu refugio del buen sonido'
const MOBILE_SUBHEADLINE = 'Instrumentos con historia y trato cercano.'

export default function HeroMarketing() {
  const [heroSrc, setHeroSrc] = useState(() => {
    if (typeof window === 'undefined') return HERO_PRIMARY_DESKTOP
    return window.matchMedia(MOBILE_QUERY).matches ? HERO_PRIMARY_MOBILE : HERO_PRIMARY_DESKTOP
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(MOBILE_QUERY)
    const syncSrc = () => setHeroSrc(mq.matches ? HERO_PRIMARY_MOBILE : HERO_PRIMARY_DESKTOP)
    syncSrc()
    mq.addEventListener('change', syncSrc)
    return () => mq.removeEventListener('change', syncSrc)
  }, [])

  return (
    <div className="hero-home relative isolate min-h-[100dvh] w-full max-md:min-h-0 overflow-hidden bg-[var(--dark-bg-page)]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          key={heroSrc}
          src={heroSrc}
          alt="La Guarida — instrumentos"
          fill
          priority
          fetchPriority="high"
          quality={60}
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
            radial-gradient(ellipse 55% 50% at 22% 42%, rgba(242, 174, 48, 0.14) 0%, transparent 52%),
            radial-gradient(ellipse 40% 45% at 85% 30%, rgba(242, 135, 41, 0.1) 0%, transparent 50%),
            linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 45%, rgba(0,0,0,0.35) 100%)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] md:hidden"
        style={{
          background:
            'radial-gradient(ellipse 100% 70% at 50% 42%, rgba(0,0,0,0.45) 0%, transparent 55%), radial-gradient(ellipse 85% 55% at 50% 38%, rgba(242, 174, 48, 0.12) 0%, transparent 50%), linear-gradient(to bottom, rgba(242, 60, 19, 0.08) 0%, transparent 28%), linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 45%), linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 35%)',
        }}
        aria-hidden
      />

      <div className="relative z-[2] flex min-h-[100dvh] w-full flex-col justify-center px-5 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(5.2rem,env(safe-area-inset-bottom,0px))] md:min-h-[100dvh] md:px-[8%] md:pb-16 md:pt-8">
        <div className="mx-auto w-full max-w-md text-center md:mx-0 md:max-w-[min(100%,28rem)] md:text-left sm:max-w-[min(100%,32rem)] lg:max-w-xl">
          <p className="mb-4 flex flex-col items-center gap-3 md:items-start">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--palette-gold)] drop-shadow-[0_0_12px_rgba(242,174,48,0.75)] sm:text-xs">
              La Guarida
            </span>
            <span
              className="h-0.5 w-12 max-md:mx-auto rounded-full md:self-start shadow-[0_0_14px_rgba(242,174,48,0.65)]"
              style={{ background: 'linear-gradient(90deg, #f2ae30, #f28729, #f23c13)' }}
              aria-hidden
            />
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
        </div>
      </div>

    </div>
  )
}
