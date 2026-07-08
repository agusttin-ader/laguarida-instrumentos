"use client"

import React from 'react'
import { layoutShellClassName } from '../lib/layoutShell'
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
        className="home-hero-section relative w-full min-w-0 !pt-0 !pb-0 bg-[var(--dark-bg-page)] md:mt-0 max-[767px]:mt-0"
      >
        <HeroMarketing slides={heroSlides} />
      </section>

      <section
        id="seleccion-destacada"
        aria-labelledby="destacados-heading"
        className="w-full bg-gradient-to-b from-[var(--dark-bg-page)] via-[var(--dark-bg-page)] to-[var(--dark-bg-page)] pt-[var(--mobile-section-gap)] max-md:pt-5 sm:pt-8 md:pt-10 pb-2 max-md:pb-1.5 sm:pb-4 md:pb-5"
      >
        <FeaturedSelection items={featuredProducts} />
      </section>

      <section
        id="marcas"
        aria-labelledby="marcas-heading"
        className={`${layoutShellClassName} mobile-gutter-x w-full sm:px-5 md:px-8 lg:px-10 min-[1920px]:px-12 min-[2560px]:px-14 pt-1 pb-4 sm:pb-6 md:pb-7 md:pt-2 border-t border-white/[0.06]`}
      >
        <HomeBrandGrid />
      </section>

      <div
        className={`${layoutShellClassName} mobile-gutter-x sm:px-5 md:px-8 lg:px-10 pt-0 pb-3 sm:pb-5 md:pb-6 min-[1920px]:px-12 min-[2560px]:px-14 max-[767px]:pb-0`}
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
      </div>
    </>
  )
}
