"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import { layoutShellClassName } from '../lib/layoutShell'
import HeroMarketing from './HeroMarketing'
import FeaturedSelection from './FeaturedSelection'
import About from './About'
import FaqSection from './FaqSection'

const HomeTrustStats = dynamic(() => import('./HomeTrustStats'))

export default function HomePageContent({ heroSlides = [], featuredProducts = [] }) {
  return (
    <>
      <section
        id="home-top"
        aria-labelledby="home-hero"
        className="home-hero-section relative w-full min-w-0 !pt-0 !pb-0 bg-[#141414] md:mt-0 max-[767px]:mt-0"
      >
        <HeroMarketing slides={heroSlides} />
      </section>

      <section
        id="seleccion-destacada"
        aria-labelledby="destacados-heading"
        className="w-full bg-gradient-to-b from-[#141414] via-[var(--dark-bg-page)] to-[var(--dark-bg-page)] pt-8 max-md:pt-7 sm:pt-12 md:pt-14 pb-3 max-md:pb-2 sm:pb-5 md:pb-6"
      >
        <FeaturedSelection items={featuredProducts} />
      </section>

      <div
        className={`${layoutShellClassName} px-4 sm:px-5 md:px-8 lg:px-10 pt-0 pb-4 sm:pb-6 md:pb-8 min-[1920px]:px-12 min-[2560px]:px-14 max-[767px]:pb-0`}
      >
        <p className="sr-only">
          La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos
          seleccionados, asesoramiento profesional y envíos dentro de Argentina.
        </p>

        <section className="mt-0 !pt-2 !pb-0 md:!pt-3 md:!pb-1">
          <About compactTop />
        </section>

        <HomeTrustStats />

        <div
          aria-hidden
          className="mx-auto my-0 sm:my-0.5 md:my-1 h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-white/18 to-transparent"
        />

        <FaqSection />
      </div>
    </>
  )
}
