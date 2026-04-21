"use client"

import React from 'react'
import { layoutShellClassName } from '../lib/layoutShell'
import HomeHeroDynamic from './HomeHeroDynamic'
import FeaturedSelection from './FeaturedSelection'
import LowCostSection from './LowCostSection'
import About from './About'
import HomeTrustStats from './HomeTrustStats'
import FaqSection from './FaqSection'

/**
 * Contenido del home: hero + secciones en una sola página (mismo flujo que desktop en móvil).
 */
export default function HomePageContent({ heroProduct }) {
  return (
    <>
      <section
        id="home-top"
        aria-labelledby="home-hero"
        className="home-hero-section relative z-0 grid w-full grid-cols-1 !pt-0 !pb-0 bg-[var(--dark-bg-page)] md:mt-0 max-[768px]:mt-0 min-h-[100dvh] max-[768px]:!min-h-0"
      >
        <div className="relative z-0 col-start-1 row-start-1 min-h-0 min-w-0">
          <HomeHeroDynamic product={heroProduct} />
        </div>
        {/*
          Slot móvil: el header se portalea aquí con sticky top-0 para que solo “siga” el scroll
          hasta el final de esta sección (hero), y luego se vaya con el bloque.
        */}
        <div
          id="home-top-mobile-header-slot"
          className="pointer-events-none col-start-1 row-start-1 self-start md:hidden [&>*]:pointer-events-auto sticky top-0 z-[var(--z-header)] w-full"
        />
      </section>

      <div
        className={`${layoutShellClassName} px-5 sm:px-6 md:px-8 lg:px-10 pt-0 sm:pt-2 md:pt-4 pb-4 sm:pb-6 md:pb-8 min-[1920px]:px-12 min-[2560px]:px-14`}
      >
        <p className="sr-only">
          La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos
          seleccionados, asesoramiento profesional y envíos dentro de Argentina.
        </p>

        <section
          id="seleccion-destacada"
          className="mt-4 min-w-0 w-full pt-0 sm:mt-6 sm:pt-3 md:mt-8 md:pt-5"
          aria-labelledby="seleccion-heading"
        >
          <FeaturedSelection />
        </section>

        <LowCostSection />

        <section className="mt-6 sm:mt-8 md:mt-10 !pt-3 !pb-0 md:!pt-5 md:!pb-1">
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
