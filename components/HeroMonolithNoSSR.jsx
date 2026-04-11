"use client"

import dynamic from 'next/dynamic'

const HeroMonolith = dynamic(() => import('./HeroMonolith'), {
  ssr: false,
  loading: () => (
    <section aria-labelledby="home-hero" className="relative w-full overflow-hidden">
      <article className="relative w-full min-h-[100vh] min-h-[100dvh] bg-[var(--dark-bg-page)]">
        <div className="hero-home-loader">
          <div className="hero-home-loader__spinner" aria-hidden />
          <img
            src="/images/logo/logo-fondo-oscuro.PNG"
            alt="La Guarida"
            width="190"
            height="68"
            className="hero-home-loader__brand"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </article>
    </section>
  ),
})

export default HeroMonolith
