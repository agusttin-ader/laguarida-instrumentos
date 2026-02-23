import React from 'react'
import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import About from '../components/About'

export const metadata = {
  title: 'Catálogo — La Guarida',
  description: 'Catálogo de guitarras e instrumentos musicales en Argentina. Venta de guitarras nuevas y usados, accesorios y amplificadores. Encontrá guitarras, bajos y equipos con asesoramiento profesional.',
  alternates: {
    canonical: 'https://laguarida.com/'
  }
}

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <main className="mt-12">
        <header className="mb-6 text-center">
          <p className="sr-only">La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos seleccionados, asesoramiento profesional y envíos dentro de Argentina.</p>
        </header>

        <section aria-labelledby="home-hero">
          <Hero />
        </section>

        <section id="seleccion-destacada" className="mt-6" aria-labelledby="seleccion-heading">
          <h2 id="seleccion-heading" className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Selección destacada</h2>
          <article>
            <ProductGrid />
          </article>
        </section>

        <section>
          <About />
        </section>
      </main>
    </div>
  )
}
