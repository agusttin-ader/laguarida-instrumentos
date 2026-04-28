'use client'

import dynamic from 'next/dynamic'

const HeroMarketing = dynamic(() => import('./HeroMarketing'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[100dvh] max-[767px]:min-h-[min(82dvh,85vh)] w-full bg-[#0a0a0a] bg-cover bg-[center_42%] bg-no-repeat bg-[url('/images/hero5-mobile.jpg')] md:bg-[url('/images/hero5-desktop.jpg')] md:bg-center"
      aria-busy="true"
      aria-label="Cargando inicio"
    />
  ),
})

export default function HomeHeroDynamic({ product }) {
  return <HeroMarketing product={product} />
}
