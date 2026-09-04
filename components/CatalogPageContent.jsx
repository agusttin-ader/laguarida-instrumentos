'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { layoutShellClassName } from '../lib/layoutShell'
import ProductGrid from './ProductGrid'
import CatalogBrandView from './CatalogBrandView'
import CatalogSidebarDivider from './CatalogSidebarDivider'
import CatalogSidebarBrandLink from './CatalogSidebarBrandLink'
import CatalogFiltersPanel from './CatalogFiltersPanel'
import CatalogEmptyFiltered from './CatalogEmptyFiltered'
import CatalogEditorialCard from './CatalogEditorialCard'
import CatalogMobileBrandChips from './CatalogMobileBrandChips'
import { useProducts } from '../hooks/useProducts'
import {
  getCatalogBrandList,
  resolveCatalogBrand,
} from '../lib/catalog/catalogTaxonomy'
import {
  applyCatalogFilters,
  catalogFiltersAreActive,
  parseCatalogFilterParams,
} from '../lib/catalog/catalogFilters'

function CatalogIntro({ filteredCount, loading, filtersActive }) {
  return (
    <div className="catalog-page-header__intro">
      <nav aria-label="Breadcrumb" className="mb-2 max-md:mb-1.5 text-xs text-[var(--dark-muted)] sm:text-sm">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="no-custom-btn inline-flex min-h-11 items-center hover:text-[var(--dark-text-primary)] transition-colors"
            >
              Inicio
            </Link>
          </li>
          <li aria-hidden className="opacity-50">/</li>
          <li className="text-[var(--dark-text-secondary)]" aria-current="page">
            Catálogo
          </li>
        </ol>
      </nav>

      <p className="section-kicker-minimal">
        Instrumentos · Stock disponible
      </p>
      <h1 className="section-heading-editorial mt-1.5 max-md:text-[1.5rem]">
        Catálogo
      </h1>
      {!loading ? (
        <p className="mt-1 text-sm tabular-nums text-[var(--dark-text-secondary)] sm:text-[0.9375rem]">
          <span className="font-semibold text-[var(--dark-text-primary)]">
            {filteredCount}
          </span>{' '}
          {filteredCount === 1 ? 'instrumento disponible' : 'instrumentos disponibles'}
          {filtersActive ? (
            <span className="text-[var(--dark-muted)]"> · filtrados</span>
          ) : null}
        </p>
      ) : null}
      <p className="mt-1 text-sm leading-relaxed text-[var(--dark-muted)] sm:text-[0.9375rem]">
        Explorá por marca y filtrá por tipo o precio.
      </p>
    </div>
  )
}

export default function CatalogPageContent({
  initialProducts = [],
  marcaParam = '',
  modeloParam = '',
  filterParams = null,
}) {
  const { products, loading } = useProducts({
    shuffleCatalog: false,
    initialProducts,
  })
  const filters = useMemo(
    () => parseCatalogFilterParams(filterParams || {}),
    [filterParams]
  )
  const catalogBrand = useMemo(() => resolveCatalogBrand(marcaParam), [marcaParam])
  const brandList = useMemo(() => getCatalogBrandList(products), [products])
  const filteredProducts = useMemo(
    () => applyCatalogFilters(products, filters),
    [products, filters]
  )
  const filtersActive = catalogFiltersAreActive(filters)

  const shellClass = `${layoutShellClassName} mobile-gutter-x sm:px-5 md:px-8 lg:px-10 py-3 max-md:py-3 sm:py-4 md:py-5 lg:pt-5 lg:pb-6 min-[1920px]:px-12`

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
      {/* Móvil: título (banner solo desktop/tablet) */}
      <div className="md:hidden mb-3">
        <CatalogIntro
          filteredCount={filteredProducts.length}
          loading={loading}
          filtersActive={filtersActive}
        />
      </div>

      <div id="catalog-results" className="md:contents">
      {/*
        Desktop: mismo grid que marcas | filtros.
        La tarjeta editorial comparte columna (y ancho) con el panel de filtros.
      */}
      <div className="catalog-layout-grid catalog-layout-grid--with-header grid gap-6 md:grid-cols-[minmax(220px,280px)_1fr] md:gap-8 lg:gap-10">
        <div className="catalog-layout-grid__intro hidden md:block">
          <CatalogIntro
            filteredCount={filteredProducts.length}
            loading={loading}
            filtersActive={filtersActive}
          />
        </div>

        <aside className="catalog-layout-grid__brands catalog-sidebar-sticky hidden md:block">
          <nav aria-label="Marcas" className="catalog-sidebar-nav">
            {brandList.map((brand, index) => (
              <React.Fragment key={brand.id}>
                {index > 0 ? <CatalogSidebarDivider /> : null}
                <CatalogSidebarBrandLink brand={brand} filters={filters} />
              </React.Fragment>
            ))}
          </nav>
        </aside>

        <div className="catalog-layout-grid__card hidden md:block">
          <CatalogEditorialCard />
        </div>

        <div className="catalog-layout-grid__main min-w-0">
          <CatalogMobileBrandChips brandList={brandList} filters={filters} />

          <CatalogFiltersPanel
            marcaParam={marcaParam}
            modeloParam={modeloParam}
            filters={filters}
            showBrandSelect
            className="mb-5 max-md:mb-4 md:mb-6"
          />

          {!loading && filteredProducts.length === 0 && filtersActive ? (
            <CatalogEmptyFiltered
              marcaParam={marcaParam}
              modeloParam={modeloParam}
            />
          ) : (
            <ProductGrid
              items={filteredProducts}
              parentLoading={loading}
              priorityFirstCard
              priorityFirstCount={1}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
