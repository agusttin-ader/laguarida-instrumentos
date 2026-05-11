'use client'

import dynamic from 'next/dynamic'

const HeroMarketing = dynamic(() => import('./HeroMarketing'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[100dvh] max-[767px]:min-h-[min(82dvh,85vh)] w-full bg-[radial-gradient(ellipse_at_center,rgba(242,174,48,0.12)_0%,rgba(10,10,10,1)_58%)]"
      aria-busy="true"
      aria-label="Cargando inicio"
    />
  ),
})

export default function HomeHeroDynamic({ product }) {
  return <HeroMarketing product={product} />
}
