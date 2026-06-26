'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { layoutShellClassName } from '../lib/layoutShell'

const ROTATE_MS = 5500

export default function HeroMarketing({ slides = [] }) {
  const heroSlides = slides.length ? slides : []
  const [activeIndex, setActiveIndex] = useState(0)
  const [carouselReady, setCarouselReady] = useState(false)

  const advance = useCallback(() => {
    if (heroSlides.length < 2) return
    setActiveIndex((i) => (i + 1) % heroSlides.length)
  }, [heroSlides.length])

  useEffect(() => {
    setCarouselReady(true)
  }, [])

  useEffect(() => {
    if (!carouselReady || heroSlides.length < 2) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return undefined
    const id = window.setInterval(advance, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [advance, carouselReady, heroSlides.length])

  const visibleIndex = carouselReady ? activeIndex : 0

  return (
    <div className="hero-home relative isolate w-full min-h-[min(88vh,920px)] overflow-hidden bg-[#141414] text-[#f7f3eb] sm:min-h-[min(84vh,880px)]">
      <div className="absolute inset-0" aria-hidden>
        {heroSlides.length ? (
          heroSlides.map((slide, i) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none ${
                i === visibleIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                priority={i === 0}
                quality={75}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-[#1a1917]" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/22 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>

      <div
        className={`${layoutShellClassName} relative z-[1] mx-auto flex min-h-[min(88vh,920px)] w-full items-center px-4 pb-14 pt-[max(5.75rem,calc(4.5rem+env(safe-area-inset-top)))] sm:min-h-[min(84vh,880px)] sm:px-5 sm:pb-16 md:px-8 md:pt-[5.75rem] lg:px-10 min-[1920px]:px-12`}
      >
        <div className="w-full max-w-xl lg:max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--palette-gold)] sm:text-xs">
            La Guarida
          </p>
          <h1
            id="home-hero"
            className="font-display text-[clamp(2rem,6.5vw,3.35rem)] font-bold leading-[1.06] tracking-tight text-[#f7f3eb]"
          >
            Tu refugio del{' '}
            <span className="block text-[clamp(2.35rem,7.5vw,4rem)] font-extrabold leading-[1.02] text-white">
              buen sonido
            </span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#e8e0d4]/90 sm:text-base md:mt-5">
            Instrumentos seleccionados del stock real. Asesoramiento profesional y atención personalizada.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8">
            <Link
              href="#marcas"
              className="no-custom-btn inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--dark-cta-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--dark-cta-text)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
            >
              Ver marcas
            </Link>
            <Link
              href="/catalogo"
              className="no-custom-btn inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Catálogo completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
