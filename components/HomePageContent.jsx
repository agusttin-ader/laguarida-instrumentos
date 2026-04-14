"use client"

import React from 'react'
import { layoutShellClassName } from '../lib/layoutShell'
import HomeHeroDynamic from './HomeHeroDynamic'
import FeaturedSelection from './FeaturedSelection'
import LowCostSection from './LowCostSection'
import About from './About'
import HomeTrustStats from './HomeTrustStats'
import FaqSection from './FaqSection'
import { useMobileHomeCatalog } from './MobileHomeCatalogContext'

/**
 * Contenido del home con vistas de catálogo solo móvil (hero + secciones condicionales).
 */
export default function HomePageContent({ heroProduct }) {
  const { effectiveView, setView } = useMobileHomeCatalog()

  const hideHeroMobile = effectiveView !== 'landing'
  const hideFeaturedMobile = effectiveView === 'lowCost'
  const hideLowCostMobile = effectiveView === 'featured'
  const hideRestMobile = effectiveView !== 'landing'
  const showBackMobile = effectiveView === 'featured' || effectiveView === 'lowCost'

  return (
    <>
      <section
        id="home-top"
        aria-labelledby="home-hero"
        className={`home-hero-section relative z-0 grid w-full grid-cols-1 !pt-0 !pb-0 bg-[var(--dark-bg-page)] md:mt-0 max-[768px]:mt-0 ${
          hideHeroMobile ? 'max-[768px]:min-h-0' : 'min-h-[100dvh] max-[768px]:!min-h-0'
        }`}
      >
        <div className="relative z-0 col-start-1 row-start-1 min-h-0 min-w-0">
          {!hideHeroMobile ? <HomeHeroDynamic product={heroProduct} /> : null}
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
        className={`${layoutShellClassName} px-4 sm:px-5 md:px-6 lg:px-8 pt-0 sm:pt-2 md:pt-4 pb-4 sm:pb-10 md:pb-12 min-[1920px]:px-10 min-[2560px]:px-12 ${
          showBackMobile ? 'max-[768px]:min-h-0' : 'min-h-screen min-h-[100dvh]'
        }`}
      >
        <header className="mb-0 sm:mb-3 md:mb-4 text-center">
          <p className="sr-only">
            La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos
            seleccionados, asesoramiento profesional y envíos dentro de Argentina.
          </p>
        </header>

        <section
          id="seleccion-destacada"
          className={`mt-2 pt-1 max-[768px]:mt-4 max-[768px]:pt-0 sm:mt-6 sm:pt-4 md:mt-8 md:pt-6 -mx-4 md:mx-0 w-[calc(100%+2rem)] md:w-auto max-w-[100vw] md:max-w-none min-w-0 ${hideFeaturedMobile ? 'max-[768px]:hidden' : ''}`}
          aria-labelledby="seleccion-heading"
        >
          <FeaturedSelection />
        </section>

        <div className={hideLowCostMobile ? 'max-[768px]:hidden' : ''}>
          <LowCostSection />
        </div>

        <section
          className={`mt-8 max-[768px]:mt-8 sm:mt-10 md:mt-12 !pt-4 !pb-4 md:!pt-6 md:!pb-6 ${hideRestMobile ? 'max-[768px]:hidden' : ''}`}
        >
          <About />
        </section>

        <div className={hideRestMobile ? 'max-[768px]:hidden' : ''}>
          <HomeTrustStats />
        </div>

        <div
          aria-hidden
          className={`mx-auto my-4 sm:my-6 md:my-8 h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-white/18 to-transparent ${hideRestMobile ? 'max-[768px]:hidden' : ''}`}
        />

        <div className={hideRestMobile ? 'max-[768px]:hidden' : ''}>
          <FaqSection />
        </div>

        {showBackMobile ? (
          <div className="mt-6 px-0 pb-0 md:hidden">
            <button
              type="button"
              className="no-custom-btn w-full min-h-[48px] rounded-xl border border-white/14 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-[var(--vintage-gold)]/35 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]"
              onClick={() => setView('landing')}
            >
              Volver al home
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}
