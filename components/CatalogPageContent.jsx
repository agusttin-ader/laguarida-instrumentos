'use client'

import React, { useMemo, useState } from 'react'
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

function CatalogMobileSearch({ value, onChange, resultCount }) {
  return (
    <div className="catalog-mobile-search mb-5 max-md:mb-4 md:hidden">
      <label htmlFor="catalog-search" className="sr-only">
        Buscar en el catálogo
      </label>
      <div className={`search-pill w-full ${value ? 'search-pill-filtering' : ''}`}>
        <span className="search-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" />
          </svg>
        </span>
        <input
          id="catalog-search"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Buscar guitarra, modelo…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="search-input min-h-[44px]"
        />
      </div>
      {value.trim() ? (
        <p className="mt-2 text-xs text-[var(--dark-muted)]">
          {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
        </p>
      ) : null}
    </div>
  )
}

export default function CatalogPageContent() {
  const searchParams = useSearchParams()
  const { products, loading } = useProducts({ shuffleCatalog: false })
  const [searchQuery, setSearchQuery] = useState('')

  const marcaParam = searchParams.get('marca') || ''
  const catalogBrand = useMemo(() => resolveCatalogBrand(marcaParam), [marcaParam])
  const brandList = useMemo(() => getCatalogBrandList(products), [products])

  const filters = useMemo(() => ({ q: searchQuery.trim() || undefined }), [searchQuery])

  const filteredCount = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return products.length
    return products.filter((item) => {
      const hay = `${item.name || ''} ${item.model || ''} ${item.description || ''}`.toLowerCase()
      return hay.includes(q)
    }).length
  }, [products, searchQuery])

  const shellClass = `${layoutShellClassName} mobile-gutter-x sm:px-5 md:px-8 lg:px-10 py-5 sm:py-8 md:py-10 min-[1920px]:px-12`

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

      <header className="mb-6 max-md:mb-5 max-w-2xl sm:mb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--dark-muted)]">
          Instrumentos · Stock real
        </p>
        <h1 className="mt-1.5 max-md:mt-1 font-display text-[clamp(1.85rem,5.5vw,3rem)] max-md:text-[clamp(1.75rem,6vw,2.15rem)] font-bold tracking-tight text-[var(--dark-text-primary)]">
          Catálogo
        </h1>
        <p className="mt-2.5 max-md:mt-2 text-[15px] leading-relaxed text-[var(--dark-muted)] sm:text-base">
          Explorá por marca y elegí el modelo en stock.
        </p>
      </header>

      <CatalogMobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        resultCount={filteredCount}
      />

      <nav
        aria-label="Marcas"
        className="catalog-mobile-brands -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
      >
        {brandList.map((brand) => (
          <Link
            key={brand.id}
            href={getHomeBrandCatalogLink(brand)}
            className="no-custom-btn shrink-0 snap-start rounded-full border border-[var(--dark-border)] bg-[var(--dark-bg-card)] px-4 py-2.5 min-h-[48px] inline-flex flex-col justify-center transition-colors hover:border-[rgba(var(--palette-gold-rgb),0.4)] active:bg-white/[0.04]"
          >
            <span className="text-xs font-semibold tracking-tight text-[var(--dark-text-primary)] whitespace-nowrap">
              {brand.name}
            </span>
            <span className="text-[10px] text-[var(--dark-muted)]">
              {brand.count} en stock
            </span>
          </Link>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(220px,280px)_1fr] lg:gap-12">
        <aside className="catalog-sidebar-sticky hidden md:block">
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
          <ProductGrid items={products} parentLoading={loading} priorityFirstCard filters={filters} />
        </div>
      </div>
    </div>
  )
}
