import React from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { layoutShellClassName } from '../lib/layoutShell'
import HomeHeroDynamic from '../components/HomeHeroDynamic'
import FeaturedSelection from '../components/FeaturedSelection'
import LowCostSection from '../components/LowCostSection'
import About from '../components/About'
import FaqSection from '../components/FaqSection'
import { fetchHeroProduct } from '../lib/data/fetchHeroProduct'

export const metadata = {
  title: 'Catálogo — La Guarida',
  description: 'Catálogo de guitarras e instrumentos musicales en Argentina. Venta de guitarras nuevas y usados, accesorios y amplificadores. Encontrá guitarras, bajos y equipos con asesoramiento profesional.',
  alternates: {
    canonical: 'https://laguaridainstrumentos.com/'
  }
}

export default async function Page() {
  // Evita servir HTML estático desfasado respecto al bundle del cliente (mismatch de hidratación tras cambios en el hero).
  noStore()
  const heroProduct = await fetchHeroProduct()

  return (
    <>
      {/* -mt en móvil: el hero se superpone a la zona del header; el header es fijo y sigue al scroll */}
      <section
        id="home-top"
        aria-labelledby="home-hero"
        className="home-hero-section w-full !pt-0 !pb-0 md:mt-0 min-h-[100dvh] bg-[var(--dark-bg-page)] -mt-[calc(58px+max(0.25rem,env(safe-area-inset-top)))] sm:-mt-[calc(62px+max(0.25rem,env(safe-area-inset-top)))]"
      >
        <HomeHeroDynamic product={heroProduct} />
      </section>

      <div className={`${layoutShellClassName} px-4 sm:px-5 md:px-6 lg:px-8 pt-2 sm:pt-6 md:pt-10 pb-8 sm:pb-10 md:pb-12 min-h-screen min-h-[100dvh] min-[1920px]:px-10 min-[2560px]:px-12`}>
        <header className="mb-0 sm:mb-3 md:mb-4 text-center">
          <p className="sr-only">La Guarida es una tienda especializada en guitarras, bajos y accesorios. Ofrecemos instrumentos seleccionados, asesoramiento profesional y envíos dentro de Argentina.</p>
        </header>

        <section id="seleccion-destacada" className="mt-2 pt-1 sm:mt-6 sm:pt-4 md:mt-10 md:pt-6 -mx-4 md:mx-0 w-[calc(100%+2rem)] md:w-auto max-w-[100vw] md:max-w-none" aria-labelledby="seleccion-heading">
          <FeaturedSelection />
        </section>

        <LowCostSection />

        <section className="mt-8 sm:mt-10 md:mt-12 !pt-4 !pb-4 md:!pt-6 md:!pb-6">
          <About />
        </section>

        <div
          aria-hidden
          className="mx-auto my-4 sm:my-6 md:my-8 h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-white/18 to-transparent"
        />

        <FaqSection />
      </div>
    </>
  )
}
