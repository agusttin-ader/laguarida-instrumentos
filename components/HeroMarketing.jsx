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
    <div className="hero-home relative w-full max-md:min-h-[min(78dvh,600px)] sm:min-h-[min(84vh,880px)] overflow-hidden bg-[#141414] text-[#f7f3eb]">
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
                className="object-cover object-[center_42%] max-md:object-[center_38%] md:object-center"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-[#1a1917]" />
        )}
        <div className="absolute inset-0 bg-black/20 max-md:bg-black/28" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/22 to-transparent max-md:from-black/72 max-md:via-black/45 max-md:to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 max-md:from-black/55 max-md:via-black/20 max-md:to-black/25" />
      </div>

      <div
        className={`${layoutShellClassName} relative mx-auto flex max-md:min-h-[min(88dvh,680px)] sm:min-h-[min(84vh,880px)] w-full max-md:items-end md:items-center px-4 max-md:pb-8 max-md:pt-[max(4.25rem,calc(3.25rem+env(safe-area-inset-top)))] pb-14 pt-[max(5.75rem,calc(4.5rem+env(safe-area-inset-top)))] sm:px-5 sm:pb-16 md:px-8 md:pt-[5.75rem] lg:px-10 min-[1920px]:px-12`}
      >
        <div className="w-full max-w-xl lg:max-w-2xl">
          <p className="mb-2.5 max-md:mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--palette-gold)] md:text-xs">
            La Guarida
          </p>
          <h1
            id="home-hero"
            className="font-display text-[clamp(1.85rem,6.2vw,3.35rem)] max-md:text-[clamp(1.75rem,7.8vw,2.35rem)] font-bold leading-[1.06] tracking-tight text-[#f7f3eb]"
          >
            Tu refugio del{' '}
            <span className="block text-[clamp(2.35rem,7.5vw,4rem)] max-md:text-[clamp(2rem,8.5vw,2.65rem)] font-extrabold leading-[1.02] text-white">
              buen sonido
            </span>
          </h1>
          <p className="mt-3 max-md:mt-2.5 max-w-md text-[15px] leading-relaxed text-[#e8e0d4]/90 max-md:text-[#f0e8dc]/95 md:text-base md:mt-5">
            Instrumentos seleccionados del stock real. Asesoramiento profesional y atención personalizada.
          </p>
          <div className="mt-5 max-md:mt-4 flex flex-wrap items-center gap-2.5 max-md:gap-2 md:mt-8">
            <Link
              href="#seleccion-destacada"
              className="no-custom-btn inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--dark-cta-bg)] px-5 max-md:px-5 py-2.5 text-sm font-semibold text-[var(--dark-cta-text)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[transform,opacity] duration-250 hover:scale-[1.02] active:scale-[0.98]"
            >
              Ver destacados
            </Link>
            <Link
              href="/catalogo"
              className="no-custom-btn inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 max-md:px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-250 hover:bg-white/20 active:bg-white/25"
            >
              Catálogo completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
