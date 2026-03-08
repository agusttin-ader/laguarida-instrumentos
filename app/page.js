import React from 'react'
import dynamic from 'next/dynamic'
import HeroMonolith from '../components/HeroMonolith'
import FeaturedSelection from '../components/FeaturedSelection'

const About = dynamic(() => import('../components/About'), { ssr: true, loading: () => <section className="min-h-[120px] flex items-center justify-center" aria-hidden><div className="animate-pulse h-8 w-48 rounded bg-white/10" /></section> })

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
      <section id="home-top" aria-labelledby="home-hero" className="w-full !pt-0 !pb-0">
        <HeroMonolith />
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-5 sm:pt-8 pb-10 md:pb-12 min-h-screen">
        <header className="mb-2 sm:mb-4 text-center">
          <p className="sr-only">La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos seleccionados, asesoramiento profesional y envíos dentro de Argentina.</p>
        </header>

        <section id="seleccion-destacada" className="mt-4 sm:mt-6" aria-labelledby="seleccion-heading">
          <FeaturedSelection />
        </section>

        <section className="!pt-2 !pb-2 md:!pt-4 md:!pb-6">
          <About />
        </section>
      </main>
    </>
  )
}
