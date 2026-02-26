import React from 'react'
import HeroCarousel from '../components/HeroCarousel'
// ProductGrid used in FeaturedSelection client component
import About from '../components/About'
import FeaturedSelection from '../components/FeaturedSelection'

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
      <section aria-labelledby="home-hero" className="w-full">
        <HeroCarousel />
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <main className="mt-12">
          <header className="mb-6 text-center">
            <p className="sr-only">La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos seleccionados, asesoramiento profesional y envíos dentro de Argentina.</p>
          </header>

          <section id="seleccion-destacada" className="mt-6" aria-labelledby="seleccion-heading">
            <FeaturedSelection />
          </section>

          <section>
            <About />
          </section>
        </main>
      </div>
    </>
  )
}
