'use client'

import dynamic from 'next/dynamic'

const HeroMarketing = dynamic(() => import('./HeroMarketing'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[100dvh] max-[768px]:min-h-[min(82dvh,85vh)] w-full bg-[var(--dark-bg-page)]"
      aria-busy="true"
      aria-label="Cargando inicio"
    />
  )
})

/**
 * Wrapper cliente: `next/dynamic` con `ssr: false` no puede usarse en Server Components (Next 16+).
 */
export default function HomeHeroDynamic({ product }) {
  return <HeroMarketing product={product} />
}
