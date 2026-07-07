"use client"

import React from 'react'
import { layoutShellClassName } from '../lib/layoutShell'
import HomeFeaturedShowcase, { HomeFeaturedCatalogLink } from './HomeFeaturedShowcase'

export default function FeaturedSelection({ items = [], loading = false }) {
  return (
    <div className="home-featured-section w-full">
      <header className={`${layoutShellClassName} mb-4 max-md:mb-3 w-full min-w-0 px-4 sm:mb-5 sm:px-5 md:mb-6 md:px-8 lg:px-10 min-[1920px]:px-12 min-[2560px]:px-14`}>
        <p className="section-kicker-minimal mb-1.5 max-md:mb-1 text-[var(--palette-gold)] tracking-[0.22em]">
          Disponibles ahora
        </p>
        <h2
          id="destacados-heading"
          className="section-heading-editorial section-underline-ocre mb-0 max-w-xl"
        >
          Novedades
        </h2>
        <p className="mt-2.5 max-md:mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--dark-muted)] md:mt-3 md:text-base">
          Tres modelos del catálogo actual. Cuando entra stock nuevo, actualizamos esta lista.
        </p>
      </header>

      <HomeFeaturedShowcase items={items} loading={loading} />

      <div className={`${layoutShellClassName} px-4 sm:px-5 md:px-8 lg:px-10 min-[1920px]:px-12 min-[2560px]:px-14`}>
        <HomeFeaturedCatalogLink />
      </div>
    </div>
  )
}
