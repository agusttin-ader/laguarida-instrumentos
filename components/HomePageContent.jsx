"use client"

import React from 'react'
import { layoutShellClassName } from '../lib/layoutShell'
import HomeHeroDynamic from './HomeHeroDynamic'
import FeaturedSelection from './FeaturedSelection'
import LowCostSection from './LowCostSection'
import About from './About'
import HomeTrustStats from './HomeTrustStats'
import FaqSection from './FaqSection'

export default function HomePageContent({ heroProduct }) {
  return (
    <>
      <section
        id="home-top"
        aria-labelledby="home-hero"
        className="home-hero-section relative z-0 grid w-full grid-cols-1 !pt-0 !pb-0 bg-[var(--dark-bg-page)] md:mt-0 max-[767px]:mt-0 min-h-[100dvh] max-[767px]:!min-h-0"
      >
        <div className="relative z-0 col-start-1 row-start-1 min-h-0 min-w-0">
          <HomeHeroDynamic product={heroProduct} />
        </div>
        <div
          id="home-top-mobile-header-slot"
          className="pointer-events-none col-start-1 row-start-1 self-start md:hidden [&>*]:pointer-events-auto sticky top-0 z-[var(--z-header)] w-full"
        />
      </section>

      <div
        className={`${layoutShellClassName} px-4 sm:px-5 md:px-8 lg:px-10 pt-0 sm:pt-2 md:pt-4 pb-4 sm:pb-6 md:pb-8 min-[1920px]:px-12 min-[2560px]:px-14 max-[767px]:pb-3`}
      >
        <p className="sr-only">
          La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos
          seleccionados, asesoramiento profesional y envíos dentro de Argentina.
        </p>

        <section
          id="seleccion-destacada"
          className="mt-8 min-w-0 w-full pt-0 sm:mt-8 sm:pt-3 md:mt-10 md:pt-5 max-[767px]:mt-8"
          aria-labelledby="seleccion-heading"
        >
          <FeaturedSelection />
        </section>

        <LowCostSection />

        <section className="mt-8 sm:mt-10 md:mt-12 !pt-3 !pb-0 md:!pt-5 md:!pb-1 max-[767px]:mt-8">
          <About />
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
