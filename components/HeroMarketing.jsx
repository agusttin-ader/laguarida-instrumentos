'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { layoutShellClassName } from '../lib/layoutShell'
import Button from './Button'

const SESSION_KEY = 'lg-hero-slide-index'
const HERO_INTERVAL_MS = 7000
const HERO_CROSSFADE_MS = 1200
const HERO_CROSSFADE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

function pickSessionSlideIndex(count) {
  if (count < 1) return 0
  if (typeof window === 'undefined') return 0

  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored !== null) {
      const index = Number(stored)
      if (Number.isInteger(index) && index >= 0 && index < count) return index
    }

    const picked = Math.floor(Math.random() * count)
    sessionStorage.setItem(SESSION_KEY, String(picked))
    return picked
  } catch {
    return 0
  }
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function heroUrlForViewport(slide) {
  if (!slide) return ''
  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  return isMobile
    ? slide.mobile || slide.src
    : slide.desktop || slide.fallback || slide.src
}

function preloadHeroSlide(slide) {
  const url = heroUrlForViewport(slide)
  if (!url || typeof window === 'undefined') return
  const img = new window.Image()
  img.src = url
}

function HeroSlidePicture({ slide, priority, onLoad }) {
  const mobile = slide.mobile || slide.src
  const desktop = slide.desktop || slide.fallback || slide.src
  const fallback = slide.fallback || slide.src

  return (
    <picture className="absolute inset-0 block h-full w-full">
      <source media="(max-width: 767px)" srcSet={mobile} type="image/webp" />
      <source media="(min-width: 768px)" srcSet={desktop} type="image/webp" />
      <img
        src={desktop}
        alt=""
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={onLoad}
        onError={(event) => {
          const img = event.currentTarget
          if (img.dataset.fallbackApplied === '1') return
          img.dataset.fallbackApplied = '1'
          img.src = fallback
        }}
        className="hero-home__img h-full w-full object-cover"
      />
    </picture>
  )
}

export default function HeroMarketing({ slides = [] }) {
  const heroSlides = slides.length ? slides : []
  const [isHydrated, setIsHydrated] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [renderIndices, setRenderIndices] = useState([0])
  const [loadedMap, setLoadedMap] = useState({})
  const [primaryReady, setPrimaryReady] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const preloadedRef = useRef(new Set())
  const slideIndexRef = useRef(0)

  useEffect(() => {
    const index = pickSessionSlideIndex(heroSlides.length)
    slideIndexRef.current = index
    setSlideIndex(index)
    setRenderIndices([index])
    setReduceMotion(prefersReducedMotion())
    const slide = heroSlides[index]
    if (slide) preloadHeroSlide(slide)
    setIsHydrated(true)
  }, [heroSlides])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!isHydrated) return undefined
    setRenderIndices((prev) => {
      if (prev.includes(slideIndex)) return prev
      return [...prev, slideIndex].slice(-2)
    })
  }, [slideIndex, isHydrated])

  useEffect(() => {
    if (!isHydrated || !heroSlides.length) return undefined

    const preloadRemaining = () => {
      heroSlides.forEach((slide, index) => {
        const key = String(index)
        if (preloadedRef.current.has(key)) return
        preloadHeroSlide(slide)
        preloadedRef.current.add(key)
      })
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(preloadRemaining, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }

    const timer = window.setTimeout(preloadRemaining, 500)
    return () => window.clearTimeout(timer)
  }, [heroSlides, isHydrated])

  useEffect(() => {
    if (!isHydrated || heroSlides.length <= 1 || reduceMotion) return undefined
    const id = window.setInterval(() => {
      setSlideIndex((current) => {
        const next = (current + 1) % heroSlides.length
        slideIndexRef.current = next
        return next
      })
    }, HERO_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [heroSlides.length, reduceMotion, isHydrated])

  useEffect(() => {
    if (!isHydrated || heroSlides.length <= 1) return undefined
    const nextIndex = (slideIndex + 1) % heroSlides.length
    const key = String(nextIndex)
    if (preloadedRef.current.has(`next-${key}`)) return undefined
    preloadHeroSlide(heroSlides[nextIndex])
    preloadedRef.current.add(`next-${key}`)
    return undefined
  }, [slideIndex, heroSlides, isHydrated])

  const markSlideLoaded = useCallback((index) => {
    setLoadedMap((prev) => (prev[index] ? prev : { ...prev, [index]: true }))
    if (index === slideIndexRef.current) setPrimaryReady(true)
  }, [])

  const activeLoaded = !isHydrated || Boolean(loadedMap[slideIndex] || reduceMotion)

  function slideOpacity(index) {
    if (!isHydrated) return index === 0 ? 1 : 0
    if (reduceMotion) return index === slideIndex ? 1 : 0
    if (index === slideIndex) return activeLoaded ? 1 : 0
    return activeLoaded ? 0 : 1
  }

  const visibleIndices = isHydrated ? renderIndices : [0]

  return (
    <div className="hero-home relative w-full max-md:min-h-[min(82dvh,640px)] md:min-h-[min(100dvh,920px)] sm:min-h-[min(84vh,880px)] overflow-hidden bg-[var(--dark-bg-page)] md:bg-transparent text-[var(--dark-text-primary)]">
      <div className="hero-home__paint-fallback absolute inset-0 md:hidden" aria-hidden />

      <div className="absolute inset-0" aria-hidden>
        {heroSlides.length > 0 ? (
          visibleIndices.map((index) => {
            const item = heroSlides[index]
            if (!item) return null
            const isActive = isHydrated ? index === slideIndex : index === 0
            const opacity = slideOpacity(index)

            return (
              <div
                key={`${item.src}-${index}`}
                className="hero-home__slide absolute inset-0 motion-reduce:transition-none"
                style={{
                  opacity,
                  transitionProperty: isHydrated && !reduceMotion ? 'opacity' : 'none',
                  transitionDuration: isHydrated && !reduceMotion ? `${HERO_CROSSFADE_MS}ms` : '0ms',
                  transitionTimingFunction: HERO_CROSSFADE_EASE,
                  zIndex: isActive ? 2 : 1,
                  pointerEvents: 'none',
                }}
              >
                <HeroSlidePicture
                  slide={item}
                  priority={!isHydrated ? index === 0 : index === slideIndex}
                  onLoad={() => markSlideLoaded(index)}
                />
              </div>
            )
          })
        ) : (
          <div className="absolute inset-0 bg-[#1E1F28] max-md:bg-transparent" />
        )}
        <div
          className={`absolute inset-0 z-[3] max-md:transition-opacity max-md:duration-300 max-md:ease-out motion-reduce:transition-none ${
            primaryReady || !heroSlides.length
              ? 'opacity-100'
              : 'max-md:opacity-40 md:opacity-100'
          }`}
        >
          <div className="absolute inset-0 bg-black/20 max-md:bg-black/28" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/22 to-transparent max-md:from-black/72 max-md:via-black/45 max-md:to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 max-md:from-black/55 max-md:via-black/20 max-md:to-black/25" />
        </div>
      </div>

      <div
        className={`${layoutShellClassName} relative z-10 mx-auto flex max-md:min-h-[min(82dvh,640px)] md:min-h-[min(100dvh,920px)] sm:min-h-[min(84vh,880px)] w-full max-md:items-end md:items-center px-4 max-md:pb-8 max-md:pt-[max(4.75rem,calc(4rem+env(safe-area-inset-top)))] pb-14 pt-[max(5.75rem,calc(4.5rem+env(safe-area-inset-top)))] sm:px-5 sm:pb-16 md:px-8 md:pt-[max(6.5rem,calc(var(--site-header-h,4.5rem)+1rem))] lg:px-10 min-[1920px]:px-12`}
      >
        <div className="w-full max-w-xl lg:max-w-2xl">
          <p className="hero-kicker max-md:mb-2 md:text-xs">
            La Guarida
          </p>
          <h1
            id="home-hero"
            className="font-display text-[clamp(1.85rem,6.2vw,3.35rem)] max-md:text-[clamp(1.75rem,7.8vw,2.35rem)] font-bold leading-[1.06] tracking-tight text-[var(--dark-text-primary)]"
          >
            Tu refugio del{' '}
            <span className="block text-[clamp(2.35rem,7.5vw,4rem)] max-md:text-[clamp(2rem,8.5vw,2.65rem)] font-extrabold leading-[1.02] text-white">
              buen sonido
            </span>
          </h1>
          <p className="hero-lead max-md:mt-2.5">
            Instrumentos seleccionados del stock real. Asesoramiento profesional y atención personalizada.
          </p>
          <div className="mt-5 max-md:mt-4 flex flex-wrap items-center gap-2.5 max-md:gap-2 md:mt-8">
            <Button href="/catalogo">
              Ver catálogo
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
            <Button href="#seleccion-destacada" variant="ghost" className="hero-btn-ghost">
              Ver novedades
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
