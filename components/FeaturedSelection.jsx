"use client"

import React from 'react'
import { layoutShellClassName } from '../lib/layoutShell'
import HomeFeaturedShowcase, { HomeFeaturedCatalogLink } from './HomeFeaturedShowcase'

export default function FeaturedSelection({ items = [], loading = false }) {
  return (
    <div className="home-featured-section w-full">
      <header className={`${layoutShellClassName} mb-5 max-md:mb-4 w-full min-w-0 px-4 sm:mb-8 sm:px-5 md:mb-10 md:px-8 lg:px-10 min-[1920px]:px-12 min-[2560px]:px-14`}>
        <p className="section-kicker-minimal section-underline-ocre mb-2 text-[var(--palette-gold)] max-md:mb-1.5">Curaduría semanal</p>
        <h2
          id="destacados-heading"
          className="section-title-minimal text-[var(--dark-text-primary)] text-2xl sm:text-3xl md:text-[2.75rem] max-md:text-[clamp(1.5rem,5.5vw,1.85rem)]"
        >
          Piezas de alta gama
        </h2>
        <p className="mt-2.5 max-md:mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--dark-muted)] md:mt-3 md:text-base">
          Los tres instrumentos más exclusivos del catálogo, renovados cada semana. Una mirada editorial a lo mejor del stock.
        </p>
      </header>

      <HomeFeaturedShowcase items={items} loading={loading} />

      <div className={`${layoutShellClassName} px-4 sm:px-5 md:px-8 lg:px-10 min-[1920px]:px-12 min-[2560px]:px-14`}>
        <HomeFeaturedCatalogLink />
      </div>
    </div>
  )
}
