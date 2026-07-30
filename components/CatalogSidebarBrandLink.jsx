import Link from 'next/link'
import { HOME_BRANDS } from '../lib/data/homeBrands'
import { getHomeBrandCatalogLink } from '../lib/catalog/catalogTaxonomy'

export default function CatalogSidebarBrandLink({ brand, active = false, filters = {} }) {
  const homeBrand = HOME_BRANDS.find((b) => b.id === brand.id)
  const logo = homeBrand?.logo

  return (
    <Link
      href={getHomeBrandCatalogLink(brand, filters)}
      aria-label={`Ver ${brand.name}`}
      aria-current={active ? 'page' : undefined}
      className={`no-custom-btn no-custom-btn--flat catalog-sidebar-item catalog-sidebar-item--brand${
        active ? ' catalog-sidebar-item--active' : ''
      }`}
    >
      {logo ? (
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
