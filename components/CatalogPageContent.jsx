'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { layoutShellClassName } from '../lib/layoutShell'
import ProductGrid from './ProductGrid'
import CatalogBrandView from './CatalogBrandView'
import CatalogSidebarDivider from './CatalogSidebarDivider'
import { useProducts } from '../hooks/useProducts'
import {
  getCatalogBrandList,
  getHomeBrandCatalogLink,
  resolveCatalogBrand,
} from '../lib/catalog/catalogTaxonomy'

export default function CatalogPageContent() {
  const searchParams = useSearchParams()
  const { products, loading } = useProducts({ shuffleCatalog: false })

  const marcaParam = searchParams.get('marca') || ''
  const catalogBrand = useMemo(() => resolveCatalogBrand(marcaParam), [marcaParam])
  const brandList = useMemo(() => getCatalogBrandList(products), [products])

  const shellClass = `${layoutShellClassName} px-4 sm:px-5 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 min-[1920px]:px-12`

  if (catalogBrand) {
    return (
      <div className={`${shellClass} catalog-page catalog-page--brand min-h-screen`}>
        <CatalogBrandView brand={catalogBrand} products={products} loading={loading} />
      </div>
    )
  }

  return (
    <div className={`${shellClass} catalog-page catalog-page--all`}>
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[var(--dark-muted)] sm:text-sm">
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

      <header className="mb-8 max-w-2xl sm:mb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--dark-muted)]">
          Instrumentos · Stock real
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-[var(--dark-text-primary)]">
          Catálogo
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--dark-muted)] sm:text-base">
          Explorá por marca y elegí el modelo en stock.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(220px,280px)_1fr] lg:gap-12">
        <aside className="catalog-sidebar-sticky">
          <nav aria-label="Marcas">
            {brandList.map((brand, index) => (
              <React.Fragment key={brand.id}>
                {index > 0 ? <CatalogSidebarDivider /> : null}
                <Link
                  href={getHomeBrandCatalogLink(brand)}
                  className="no-custom-btn block w-full border-l-2 border-transparent py-4 pl-5 pr-2 transition-colors hover:border-[rgba(var(--palette-gold-rgb),0.45)] hover:bg-white/[0.03]"
                >
                  <p className="font-display text-base font-semibold tracking-tight text-[var(--dark-text-primary)]">
                    {brand.name}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--dark-muted)]">
                    {brand.kicker}
                  </p>
                  <p className="mt-2 text-xs text-[var(--dark-muted)]">
                    {brand.count} {brand.count === 1 ? 'instrumento' : 'instrumentos'}
                  </p>
                </Link>
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
