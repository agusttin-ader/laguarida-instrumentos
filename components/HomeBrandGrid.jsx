import Link from 'next/link'
import Button from './Button'
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
  ibanez: 'compact',
  otros: 'compact',
}

const LOGO_SIZES = {
  wide: 'h-10 w-auto max-w-[min(90%,12.5rem)] sm:h-11 md:h-12 lg:h-[3.35rem]',
  default: 'h-9 w-auto max-w-[min(92%,10rem)] sm:h-10 md:h-11 lg:h-12',
  compact: 'h-8 w-auto max-w-[calc(100%-0.25rem)] sm:h-9 md:h-10',
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
    <img
      src={src}
      alt=""
      aria-hidden
      className={`home-brand-logo ${monoClass} min-w-0 max-w-full object-contain object-left ${toneClass} ${sizeClass}`}
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
  const type = TILE_TYPE[brand.id] ?? 'default'
  const hasLogo = Boolean(brand.logo)

  return (
    <Link
      href={`/catalogo?marca=${encodeURIComponent(brand.filterBrand)}`}
      className={`home-brand-tile group relative grid h-full w-full grid-cols-[minmax(0,1fr)_2rem] items-center gap-2 rounded-2xl border border-white/[0.08] bg-[var(--dark-bg-card)]/90 p-4 transition-[box-shadow,border-color,transform] duration-200 sm:grid-cols-[minmax(0,1fr)_2.25rem] sm:gap-2.5 sm:p-5 md:rounded-[1.25rem] md:p-5 lg:gap-3 lg:p-6 hover:border-[color-mix(in_srgb,var(--brand-accent)_50%,transparent)] hover:shadow-[0_18px_48px_rgba(0,0,0,0.38)] active:scale-[0.99]`}
      style={{ '--brand-accent': brand.accent }}
      aria-label={`Ver ${brand.name}`}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        style={{
          background: `radial-gradient(ellipse 130% 90% at 15% 115%, ${brand.accent}30 0%, transparent 58%), radial-gradient(circle at 100% 0%, ${brand.accent}12 0%, transparent 42%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden
      />

      <div className="home-brand-tile__content relative z-10 min-w-0">
        {hasLogo ? (
          <BrandLogoGroup brand={brand} type={type} />
        ) : (
          <h3 className="font-display text-[clamp(1.35rem,2.5vw,2rem)] font-bold leading-[1] tracking-tight text-[var(--dark-text-primary)] transition-colors duration-300 group-hover:text-white">
            {brand.name}
          </h3>
        )}
      </div>

      <span
        className="home-brand-tile__action relative z-20 flex h-8 w-8 shrink-0 items-center justify-center justify-self-end rounded-full border border-white/10 bg-black/20 text-[var(--dark-text-secondary)] md:h-9 md:w-9"
        aria-hidden
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
        </svg>
      </span>
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
              className="mb-4 hidden h-16 w-px bg-gradient-to-b from-[var(--palette-flame)] via-[var(--palette-orange)] to-transparent lg:block"
              aria-hidden
            />
            <p className="section-kicker-minimal">Marcas que manejamos</p>
            <h2 id="marcas-heading" className="section-heading-editorial mt-2 max-w-xs lg:max-w-sm">
              Elegí por marca
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--dark-muted)] sm:text-[15px] lg:mt-4">
              Stock real por fabricante. Tocá una marca para ver lo disponible hoy.
            </p>
          </div>
        </aside>

        <div className="md:col-span-8 xl:col-span-9">
          <nav
            aria-label="Marcas del catálogo"
            className="home-brand-bento grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-12 md:gap-3.5"
          >
            {HOME_BRANDS.map((brand) => (
              <div key={brand.id} className={TILE_LAYOUT[brand.id] ?? TILE_LAYOUT.otros}>
                <BrandTile brand={brand} />
              </div>
            ))}
          </nav>

          <div className="mt-6 flex justify-start md:mt-7">
            <Button href="/catalogo" variant="brand-ghost">
              Ver catálogo completo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
