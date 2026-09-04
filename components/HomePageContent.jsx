import React from 'react'
import { homeSectionShellClass } from '../lib/layoutShell'
import FadeInView from './motion/FadeInView'
import HeroMarketing from './HeroMarketing'
import FeaturedSelection from './FeaturedSelection'
import HomeBrandGrid from './HomeBrandGrid'
import About from './About'
import FaqSection from './FaqSection'

export default function HomePageContent({ heroSlides = [], featuredProducts = [] }) {
  return (
    <>
      <section
        id="home-top"
        aria-labelledby="home-hero"
        className="home-hero-section relative w-full min-w-0 !pt-0 !pb-0 bg-[var(--dark-bg-page)] md:bg-transparent md:mt-0 max-[767px]:mt-0"
      >
        <HeroMarketing slides={heroSlides} />
      </section>

      <FadeInView
        as="section"
        id="seleccion-destacada"
        aria-labelledby="destacados-heading"
        variant="fade-up"
        delay={0.02}
        className="w-full border-t border-white/[0.06] bg-gradient-to-b from-[var(--dark-bg-page)] via-[var(--dark-bg-page)] to-[var(--dark-bg-page)] pt-[var(--mobile-section-gap)] max-md:pt-5 sm:pt-8 md:pt-10 pb-2 max-md:pb-1.5 sm:pb-4 md:pb-5"
      >
        <FeaturedSelection items={featuredProducts} />
      </FadeInView>

      <FadeInView
        as="section"
        id="marcas"
        aria-labelledby="marcas-heading"
        variant="fade-up"
        delay={0.04}
        className={`${homeSectionShellClass} pt-1 pb-4 sm:pb-6 md:pb-7 md:pt-2 border-t border-white/[0.06]`}
      >
        <HomeBrandGrid />
      </FadeInView>

      <FadeInView
        as="div"
        variant="fade-up"
        delay={0.02}
        className={`${homeSectionShellClass} pt-0 pb-3 sm:pb-5 md:pb-6 max-[767px]:pb-0`}
      >
        <p className="sr-only">
          La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos
          seleccionados, asesoramiento profesional y envíos dentro de Argentina.
        </p>

        <section className="mt-0 !pt-1 !pb-0 md:!pt-2 md:!pb-0">
          <About compactTop />
        </section>

        <div
          aria-hidden
          className="mx-auto my-0 h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-white/18 to-transparent"
        />

        <FaqSection />
      </FadeInView>
    </>
  )
}
