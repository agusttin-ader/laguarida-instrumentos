'use client'

import Image from 'next/image'
import Link from 'next/link'
import { HOME_BRANDS } from '../lib/data/homeBrands'

function BrandCard({ brand }) {
  return (
    <Link
      href={`/catalogo?marca=${encodeURIComponent(brand.filterBrand)}`}
      className="home-brand-card group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--dark-bg-card)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[rgba(var(--palette-gold-rgb),0.28)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] active:scale-[0.99] motion-reduce:transition-none md:rounded-3xl"
      aria-label={`Ver guitarras ${brand.name}`}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-[var(--dark-surface-2)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(ellipse 80% 70% at 50% 100%, ${brand.accent}22 0%, transparent 68%)`,
          }}
          aria-hidden
        />
        <Image
          src={brand.image}
          alt=""
          fill
          sizes="(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 18vw"
          quality={68}
          className="object-contain object-center p-4 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-5 md:p-6"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-white/[0.06] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: brand.accent }}
            >
              {brand.name}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-[var(--dark-muted)] sm:text-[13px]">
              {brand.tagline}
            </p>
          </div>
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--dark-text-secondary)] transition-all duration-300 group-hover:border-[rgba(var(--palette-gold-rgb),0.35)] group-hover:bg-[rgba(var(--palette-gold-rgb),0.08)] group-hover:text-[var(--vintage-gold)]"
            aria-hidden
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function HomeBrandGrid() {
  return (
    <section id="marcas" aria-labelledby="marcas-heading" className="home-brand-grid w-full">
      <header className="mb-6 max-md:mb-5 sm:mb-10 md:mb-12">
        <p className="section-kicker-minimal text-[var(--palette-gold)]">Marcas que manejamos</p>
        <h2
          id="marcas-heading"
          className="section-title-minimal mt-2 text-[var(--dark-text-primary)] text-[clamp(1.75rem,4vw,2.5rem)]"
        >
          Elegí por marca
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--dark-muted)] sm:text-[15px]">
          Fender, Gibson, PRS, Ibanez, Taylor y más. Entrá directo al stock de cada fabricante.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {HOME_BRANDS.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      <div className="mt-8 flex justify-center sm:mt-10">
        <Link
          href="/catalogo"
          className="no-custom-btn inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[var(--dark-text-secondary)] transition-colors duration-200 hover:border-[rgba(var(--palette-gold-rgb),0.35)] hover:text-[var(--dark-text-primary)] active:scale-[0.98]"
        >
          Ver catálogo completo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
