import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import RelatedProducts from '../components/RelatedProducts'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <Header />
      <main className="mt-12">
        <Hero />
        <RelatedProducts />

        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Selección destacada</h2>
          <ProductGrid />
        </section>
      </main>
      <Footer />
    </div>
  )
}
