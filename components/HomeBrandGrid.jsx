'use client'

import Link from 'next/link'
import { HOME_BRANDS } from '../lib/data/homeBrands'

const TILE_LAYOUT = {
  fender: 'col-span-1 md:col-span-6 md:min-h-[6.25rem] lg:min-h-[7.25rem]',
  gibson: 'col-span-1 md:col-span-6 md:min-h-[6.25rem] lg:min-h-[7.25rem]',
  prs: 'col-span-2 md:col-span-6 md:min-h-[5.5rem] lg:min-h-[6rem]',
  ibanez: 'col-span-1 md:col-span-3 md:min-h-[5.5rem] lg:min-h-[6rem]',
  otros: 'col-span-1 md:col-span-3 md:min-h-[5.5rem] lg:min-h-[6rem]',
}

const TILE_TYPE = {
  fender: 'default',
  gibson: 'default',
  prs: 'wide',
  ibanez: 'default',
  otros: 'default',
}

const LOGO_SIZES = {
  wide: 'h-10 w-auto max-w-[min(90%,12.5rem)] sm:h-11 md:h-12 lg:h-[3.35rem]',
  default: 'h-9 w-auto max-w-[min(92%,10rem)] sm:h-10 md:h-11 lg:h-12',
}

const PARTNER_LOGO_SIZES = {
  wide: 'h-7 w-auto max-w-[min(78%,8.5rem)] sm:h-8 md:h-9',
  default: 'h-7 w-auto max-w-[min(82%,8.5rem)] sm:h-8 md:h-9',
}

const LOGO_TREATMENTS = {
  mono: 'brightness-0 invert opacity-[0.92]',
  light: 'opacity-[0.95]',
}

function BrandLogoImage({ src, sizeClass, treatment = 'mono' }) {
  const toneClass = LOGO_TREATMENTS[treatment] ?? LOGO_TREATMENTS.mono
  const monoClass = treatment === 'mono' ? 'home-brand-logo--mono' : ''

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      className={`home-brand-logo ${monoClass} shrink-0 object-contain object-left transition-[opacity,transform] duration-300 group-hover:scale-[1.02] group-hover:opacity-100 ${toneClass} ${sizeClass}`}
    />
  )
}

function BrandLogoGroup({ brand, type }) {
  if (!brand.logo) return null

  const mainSize = LOGO_SIZES[type] ?? LOGO_SIZES.default
  const partnerSize = PARTNER_LOGO_SIZES[type] ?? PARTNER_LOGO_SIZES.default
  const partners = brand.partnerLogos ?? []

  if (partners.length === 0) {
    return <BrandLogoImage src={brand.logo} sizeClass={mainSize} />
  }

  return (
    <div className="flex min-w-0 flex-col items-start gap-2 sm:gap-2.5">
      <BrandLogoImage src={brand.logo} sizeClass={mainSize} />
      <div className="flex min-w-0 flex-col items-start gap-2 pl-0.5" aria-hidden>
        <span className="h-px w-5 shrink-0 bg-white/15" />
        {partners.map((partner) => (
          <BrandLogoImage
            key={partner.src}
            src={partner.src}
            sizeClass={partnerSize}
            treatment={partner.treatment ?? 'mono'}
          />
        ))}
      </div>
    </div>
  )
}

function BrandTile({ brand }) {
  const layout = TILE_LAYOUT[brand.id] ?? TILE_LAYOUT.otros
  const type = TILE_TYPE[brand.id] ?? 'default'
  const hasLogo = Boolean(brand.logo)

  return (
    <Link
      href={`/catalogo?marca=${encodeURIComponent(brand.filterBrand)}`}
      className={`home-brand-tile group relative flex overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--dark-bg-card)]/90 p-4 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand-accent)_45%,transparent)] hover:shadow-[0_18px_48px_rgba(0,0,0,0.38)] active:scale-[0.995] sm:p-5 md:rounded-[1.25rem] md:p-5 lg:p-6 ${layout}`}
      style={{ '--brand-accent': brand.accent }}
      aria-label={`Ver ${brand.name}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-300 group-hover:opacity-110"
        style={{
          background: `radial-gradient(ellipse 130% 90% at 15% 115%, ${brand.accent}30 0%, transparent 58%), radial-gradient(circle at 100% 0%, ${brand.accent}12 0%, transparent 42%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-2">
          {hasLogo ? (
            <BrandLogoGroup brand={brand} type={type} />
          ) : (
            <h3 className="font-display text-[clamp(1.35rem,2.5vw,2rem)] font-bold leading-[1] tracking-tight text-[var(--dark-text-primary)] transition-colors duration-300 group-hover:text-white">
              {brand.name}
            </h3>
          )}

          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-[var(--dark-text-secondary)] backdrop-blur-sm transition-all duration-300 group-hover:border-[color-mix(in_srgb,var(--brand-accent)_50%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--brand-accent)_18%,transparent)] group-hover:text-white md:h-9 md:w-9"
            aria-hidden
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </div>

        <p className="line-clamp-2 text-[11px] leading-snug text-[var(--dark-muted)] sm:text-xs">
          {brand.tagline}
        </p>
      </div>
    </Link>
  )
}

export default function HomeBrandGrid() {
  return (
    <div aria-labelledby="marcas-heading" className="home-brand-grid w-full">
      <div className="md:grid md:grid-cols-12 md:items-start md:gap-8 lg:gap-10 xl:gap-12">
        <aside className="home-brand-grid__aside mb-7 md:col-span-4 md:mb-0 xl:col-span-3">
          <div className="relative pl-0 lg:pl-1">
            <span
              className="mb-4 hidden h-16 w-px bg-gradient-to-b from-[var(--palette-gold)] via-[var(--palette-orange)] to-transparent lg:block"
              aria-hidden
            />
            <p className="section-kicker-minimal text-[var(--palette-gold)]">Marcas que manejamos</p>
            <h2 id="marcas-heading" className="section-heading-editorial mt-2 max-w-xs lg:max-w-sm">
              Elegí por marca
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--dark-muted)] sm:text-[15px] lg:mt-4">
              Stock disponible, curado por fabricante. Tocá una marca para ver lo que hay hoy.
            </p>
          </div>
        </aside>

        <div className="md:col-span-8 xl:col-span-9">
          <nav
            aria-label="Marcas del catálogo"
            className="home-brand-bento grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-12 md:gap-3.5"
          >
            {HOME_BRANDS.map((brand) => (
              <BrandTile key={brand.id} brand={brand} />
            ))}
          </nav>

          <div className="mt-6 flex justify-start md:mt-7">
            <Link
              href="/catalogo"
              className="no-custom-btn group inline-flex min-h-[44px] items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-[var(--dark-text-secondary)] transition-all duration-300 hover:border-[rgba(var(--palette-gold-rgb),0.35)] hover:bg-white/[0.06] hover:text-[var(--dark-text-primary)]"
            >
              Ver catálogo completo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
