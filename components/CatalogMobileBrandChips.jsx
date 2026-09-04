import Link from 'next/link'
import { HOME_BRANDS } from '../lib/data/homeBrands'
import { catalogHref } from '../lib/catalog/catalogFilters'
import { getHomeBrandCatalogLink } from '../lib/catalog/catalogTaxonomy'

const chipBase =
  'no-custom-btn inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium tracking-tight transition-[border-color,background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]'

const chipInactive =
  'border-white/10 bg-white/[0.03] text-[var(--dark-text-secondary)] hover:border-white/18 hover:bg-white/[0.06] hover:text-[var(--dark-text-primary)]'

const chipActive =
  'border-[color-mix(in_srgb,var(--vintage-gold)_55%,transparent)] bg-[color-mix(in_srgb,var(--vintage-gold)_12%,transparent)] text-[var(--dark-text-primary)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--vintage-gold)_20%,transparent)]'

export default function CatalogMobileBrandChips({ brandList = [], filters = {} }) {
  if (!brandList.length) return null

  return (
    <nav aria-label="Marcas" className="catalog-mobile-brand-chips md:hidden -mx-1 mb-4">
      <ul className="flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <Link
            href={catalogHref({ ...filters })}
            className={`${chipBase} ${chipActive}`}
            aria-current="page"
          >
            Todas
          </Link>
        </li>
        {brandList.map((brand) => {
          const homeBrand = HOME_BRANDS.find((b) => b.id === brand.id)
          const logo = homeBrand?.logo

          return (
            <li key={brand.id} className="shrink-0">
              <Link
                href={getHomeBrandCatalogLink(brand, filters)}
                className={`${chipBase} ${chipInactive}`}
                aria-label={`Ver ${brand.name}`}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt=""
                    aria-hidden
                    className="h-4 w-auto max-w-[4.5rem] object-contain object-left brightness-0 invert opacity-90"
                  />
                ) : (
                  <span>{brand.name}</span>
                )}
                <span className="tabular-nums text-[11px] text-[var(--dark-muted)]">{brand.count}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
