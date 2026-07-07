'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { layoutShellClassName } from '../lib/layoutShell'
import ProductGrid from './ProductGrid'
import CatalogBrandView from './CatalogBrandView'
import CatalogSidebarDivider from './CatalogSidebarDivider'
import CatalogHorizontalTabs from './CatalogHorizontalTabs'
import CatalogSidebarBrandLink from './CatalogSidebarBrandLink'
import { useProducts } from '../hooks/useProducts'
import {
  getCatalogBrandList,
  getHomeBrandCatalogLink,
  resolveCatalogBrand,
} from '../lib/catalog/catalogTaxonomy'

export default function CatalogPageContent({
  initialProducts = [],
  marcaParam = '',
  modeloParam = '',
}) {
  const { products, loading } = useProducts({
    shuffleCatalog: false,
    initialProducts,
  })
  const catalogBrand = useMemo(() => resolveCatalogBrand(marcaParam), [marcaParam])
  const brandList = useMemo(() => getCatalogBrandList(products), [products])

  const shellClass = `${layoutShellClassName} mobile-gutter-x sm:px-5 md:px-8 lg:px-10 py-5 max-md:py-4 sm:py-8 md:py-10 min-[1920px]:px-12`

  if (catalogBrand) {
    return (
      <div className={`${shellClass} catalog-page catalog-page--brand min-h-screen`}>
        <CatalogBrandView
          brand={catalogBrand}
          products={products}
          loading={loading}
          marcaParam={marcaParam}
          modeloParam={modeloParam}
        />
      </div>
    )
  }

  return (
    <div className={`${shellClass} catalog-page catalog-page--all`}>
      <nav aria-label="Breadcrumb" className="mb-3 max-md:mb-2.5 text-xs text-[var(--dark-muted)] sm:text-sm">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="no-custom-btn hover:text-[var(--dark-text-primary)] transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden className="opacity-50">/</li>
          <li className="text-[var(--dark-text-secondary)]" aria-current="page">
            Catálogo
          </li>
        </ol>
      </nav>

      <header className="mb-6 max-md:mb-4 sm:mb-8 md:mb-10">
        <p className="section-kicker-minimal text-[var(--palette-gold)]">
          Instrumentos · Stock disponible
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3 max-md:gap-2">
          <div className="max-w-2xl">
            <h1 className="section-heading-editorial max-md:text-[1.625rem]">
              Catálogo
            </h1>
            <p className="mt-2 max-md:mt-1.5 text-[15px] leading-relaxed text-[var(--dark-muted)] max-md:text-sm sm:text-base">
              Explorá por marca y elegí el modelo en stock.
            </p>
          </div>
          {!loading ? (
            <p className="shrink-0 text-sm tabular-nums text-[var(--dark-muted)]">
              {products.length} {products.length === 1 ? 'instrumento' : 'instrumentos'}
            </p>
          ) : null}
        </div>
      </header>

      <CatalogHorizontalTabs
        label="Filtrar por marca"
        ariaLabel="Marcas"
        className="catalog-mobile-brands max-md:-mx-[var(--mobile-gutter)] mb-4 max-md:mb-3"
        items={brandList.map((brand) => ({
          id: brand.id,
          label: brand.name,
          sublabel: `${brand.count} en stock`,
          href: getHomeBrandCatalogLink(brand),
        }))}
      />

      <div className="catalog-layout-grid grid gap-8 md:grid-cols-[minmax(220px,280px)_1fr] md:gap-10 lg:gap-12">
        <aside className="catalog-sidebar-sticky hidden md:block">
          <nav aria-label="Marcas" className="catalog-sidebar-nav">
            {brandList.map((brand, index) => (
              <React.Fragment key={brand.id}>
                {index > 0 ? <CatalogSidebarDivider /> : null}
                <CatalogSidebarBrandLink brand={brand} />
              </React.Fragment>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <ProductGrid items={products} parentLoading={loading} priorityFirstCard />
        </div>
      </div>
    </div>
  )
}
