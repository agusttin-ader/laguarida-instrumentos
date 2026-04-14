"use client"

import React, { useEffect, useMemo, useState } from 'react'
import ProductGrid from './ProductGrid'
import MobileCatalogShowcaseSlider from './MobileCatalogShowcaseSlider'
import ScrollReveal from './ScrollReveal'
import { useMobileHomeCatalog } from './MobileHomeCatalogContext'
import { useProducts } from '../hooks/useProducts'

function filterByQuery(items, q) {
  const t = q && String(q).trim()
  if (!t) return items
  const qLower = t.toLowerCase()
  return items.filter((item) => {
    const hay = (
      String(item.name || '') +
      ' ' +
      String(item.model || '') +
      ' ' +
      String(item.description || '')
    ).toLowerCase()
    return hay.includes(qLower)
  })
}

export default function FeaturedSelection() {
  const [q, setQ] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const { effectiveView, isMobile, setView } = useMobileHomeCatalog()
  const { products, loading: productsLoading } = useProducts({ shuffleCatalog: true })
  const featured = Array.isArray(products) ? products.filter((p) => p.low_cost !== true) : []
  const filteredFeatured = useMemo(() => filterByQuery(featured, q), [featured, q])

  useEffect(() => {
    if (!q) {
      setIsFiltering(false)
      return
    }
    setIsFiltering(true)
    const t = window.setTimeout(() => setIsFiltering(false), 260)
    return () => window.clearTimeout(t)
  }, [q])

  const showMobileExpand =
    isMobile &&
    effectiveView === 'landing' &&
    !productsLoading &&
    filteredFeatured.length > 0
  const hideGridOnMobile =
    isMobile &&
    effectiveView === 'landing' &&
    !productsLoading &&
    filteredFeatured.length > 0
  const showMobileSlider = isMobile && effectiveView === 'landing'

  return (
    <>
      <ScrollReveal className="mb-3 w-full min-w-0 sm:mb-5 md:mb-6" threshold={0.1} rootMargin="0px 0px -6% 0px">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 md:gap-6 px-4 md:px-0">
          <div className="min-w-0">
            <h2
              id="seleccion-heading"
              className="section-title-premium section-underline-ocre text-gray-900 dark:text-white"
            >
              Selección destacada
            </h2>
            <p className="mt-2 text-[12px] sm:text-[13px] text-[var(--dark-muted)] max-[768px]:hidden">
              Encontrá instrumentos seleccionados por calidad y estado.
            </p>
          </div>
          <div className="w-full sm:w-auto min-w-0 max-[768px]:order-3 min-[769px]:order-none">
            <div
              className={`search-pill w-full sm:max-w-sm ${isFiltering ? 'search-pill-filtering' : ''}`}
              role="search"
            >
              <span className="search-icon flex-shrink-0" aria-hidden>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="18"
                  height="18"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                  />
                </svg>
              </span>
              <input
                aria-label="Buscar en selección destacada"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar en destacada (ej. Strato, Les Paul)"
                className="search-input"
              />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {showMobileSlider ? (
        <div className="mb-4 px-0 md:hidden">
          <MobileCatalogShowcaseSlider items={filteredFeatured} loading={productsLoading} />
        </div>
      ) : null}

      {showMobileExpand ? (
        <div className="mb-4 px-4 md:hidden">
          <button
            type="button"
            className="no-custom-btn w-full min-h-[48px] rounded-xl border border-white/14 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-[var(--vintage-gold)]/35 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]"
            onClick={() => setView('featured')}
          >
            Ver catálogo completo
          </button>
        </div>
      ) : null}

      <article className={`${isFiltering ? 'filter-grid-updating' : ''} ${hideGridOnMobile ? 'max-[768px]:hidden' : ''}`}>
        <ProductGrid
          filters={{ q }}
          items={featured}
          parentLoading={productsLoading}
          primaryImageOnly
        />
      </article>
    </>
  )
}
