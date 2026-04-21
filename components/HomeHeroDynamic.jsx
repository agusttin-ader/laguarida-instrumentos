'use client'

import dynamic from 'next/dynamic'

const HeroMarketing = dynamic(() => import('./HeroMarketing'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[100dvh] max-[768px]:min-h-[min(82dvh,85vh)] w-full bg-[#0a0a0a] bg-cover bg-[center_42%] bg-no-repeat md:bg-center"
      style={{ backgroundImage: "url('/images/hero-2.jpg')" }}
      aria-busy="true"
      aria-label="Cargando inicio"
    />
  ),
})

/**
 * Wrapper cliente: `next/dynamic` con `ssr: false` no puede usarse en Server Components (Next 16+).
 */
export default function HomeHeroDynamic({ product }) {
  return <HeroMarketing product={product} />
}
