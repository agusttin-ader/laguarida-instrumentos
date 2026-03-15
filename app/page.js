import React from 'react'
import dynamic from 'next/dynamic'
import HeroMonolith from '../components/HeroMonolith'
import FeaturedSelection from '../components/FeaturedSelection'
import LowCostSection from '../components/LowCostSection'

const About = dynamic(() => import('../components/About'), { ssr: true, loading: () => <section className="min-h-[120px] flex items-center justify-center" aria-hidden><div className="animate-pulse h-8 w-48 rounded bg-white/10" /></section> })
const FaqSection = dynamic(() => import('../components/FaqSection'), { ssr: true, loading: () => <section className="min-h-[120px] flex items-center justify-center" aria-hidden><div className="animate-pulse h-8 w-48 rounded bg-white/10" /></section> })

export const metadata = {
  title: 'Catálogo — La Guarida',
  description: 'Catálogo de guitarras e instrumentos musicales en Argentina. Venta de guitarras nuevas y usados, accesorios y amplificadores. Encontrá guitarras, bajos y equipos con asesoramiento profesional.',
  alternates: {
    canonical: 'https://laguarida.com/'
  }
}

export default function Page() {
  return (
    <>
      {/* -mt en móvil: el hero se superpone a la zona del header para que la imagen ocupe todo el fondo; el header hace scroll con la página */}
      <section
        id="home-top"
        aria-labelledby="home-hero"
        className="home-hero-section w-full !pt-0 !pb-0 md:mt-0 min-h-[100dvh] bg-[var(--dark-bg-page)] -mt-[calc(52px+max(0.25rem,env(safe-area-inset-top)))] sm:-mt-[calc(56px+max(0.25rem,env(safe-area-inset-top)))]"
      >
        <HeroMonolith />
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-0 sm:pt-6 md:pt-10 pb-8 sm:pb-10 md:pb-12 min-h-screen min-h-[100dvh]">
        <header className="mb-0 sm:mb-3 md:mb-4 text-center">
          <p className="sr-only">La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos seleccionados, asesoramiento profesional y envíos dentro de Argentina.</p>
        </header>

        <section id="seleccion-destacada" className="mt-0 pt-0 sm:mt-6 sm:pt-4 md:mt-10 md:pt-6 -mx-4 md:mx-0 w-[calc(100%+2rem)] md:w-auto max-w-[100vw] md:max-w-none" aria-labelledby="seleccion-heading">
          <FeaturedSelection />
        </section>

        <LowCostSection />

        <section className="mt-8 sm:mt-10 md:mt-12 !pt-4 !pb-4 md:!pt-6 md:!pb-6">
          <About />
        </section>

        <FaqSection />
      </main>
    </>
  )
}
