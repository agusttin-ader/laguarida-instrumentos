import Link from 'next/link'
import { HOME_BRANDS } from '../lib/data/homeBrands'
import { getHomeBrandCatalogLink } from '../lib/catalog/catalogTaxonomy'

export default function CatalogSidebarBrandLink({ brand }) {
  const homeBrand = HOME_BRANDS.find((b) => b.id === brand.id)
  const logo = homeBrand?.logo

  return (
    <Link
      href={getHomeBrandCatalogLink(brand)}
      aria-label={`Ver ${brand.name}`}
      className="no-custom-btn no-custom-btn--flat catalog-sidebar-item catalog-sidebar-item--brand"
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" aria-hidden className="catalog-sidebar-item__logo" />
      ) : (
        <span className="catalog-sidebar-item__name-fallback">{brand.name}</span>
      )}
      <p className="catalog-sidebar-item__kicker">{brand.kicker}</p>
      <p className="catalog-sidebar-item__count">
        {brand.count} {brand.count === 1 ? 'instrumento' : 'instrumentos'}
      </p>
    </Link>
  )
}
