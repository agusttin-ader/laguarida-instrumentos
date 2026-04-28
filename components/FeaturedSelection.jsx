"use client"

import React, { useEffect, useState } from 'react'
import ProductGrid from './ProductGrid'
import ScrollReveal from './ScrollReveal'
import { useProducts } from '../hooks/useProducts'

export default function FeaturedSelection() {
  const [q, setQ] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { products, loading: productsLoading } = useProducts({ shuffleCatalog: true })
  const featured = Array.isArray(products) ? products.filter((p) => p.low_cost !== true) : []

  useEffect(() => {
    if (!q) {
      setIsFiltering(false)
      return
    }
    setIsFiltering(true)
    const t = window.setTimeout(() => setIsFiltering(false), 260)
    return () => window.clearTimeout(t)
  }, [q])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (filtersOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [filtersOpen])

  return (
    <>
      <ScrollReveal className="mb-3 w-full min-w-0 sm:mb-4 md:mb-5" threshold={0.1} rootMargin="0px 0px -6% 0px">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 md:gap-6">
          <div className="min-w-0">
            <h2
              id="seleccion-heading"
              className="section-title-premium section-underline-ocre text-gray-900 dark:text-white"
            >
              Selección destacada
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--dark-muted)] md:text-[13px]">
              Encontrá instrumentos seleccionados por calidad y estado.
            </p>
          </div>
          <div className="order-3 w-full min-w-0 sm:order-none sm:w-auto">
            <div
              className={`search-pill hidden w-full sm:max-w-sm md:flex ${isFiltering ? 'search-pill-filtering' : ''}`}
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
            <button
              type="button"
              className="no-custom-btn md:hidden inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-[var(--dark-text-primary)] active:bg-white/[0.1] transition-colors touch-manipulation"
              onClick={() => setFiltersOpen(true)}
              aria-expanded={filtersOpen}
              aria-controls="featured-filters-sheet"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 6h18M6 12h12M10 18h4" />
              </svg>
              Filtros y búsqueda
            </button>
          </div>
        </div>
      </ScrollReveal>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[10020] md:hidden" role="dialog" aria-modal="true" aria-label="Filtros de selección destacada">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
          />
          <div
            id="featured-filters-sheet"
            className="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[var(--dark-bg-surface)] px-4 pb-[max(1.1rem,calc(0.9rem+env(safe-area-inset-bottom)))] pt-3 shadow-[0_-18px_36px_rgba(0,0,0,0.45)]"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" aria-hidden />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--dark-text-primary)]">Buscar en destacada</h3>
              <button
                type="button"
                className="no-custom-btn inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 text-sm font-medium text-[var(--dark-muted)]"
                onClick={() => setFiltersOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <div className={`search-pill w-full ${isFiltering ? 'search-pill-filtering' : ''}`} role="search">
              <span className="search-icon flex-shrink-0" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
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
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                className="no-custom-btn inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-[var(--dark-text-secondary)]"
                onClick={() => setQ('')}
              >
                Limpiar
              </button>
              <button
                type="button"
                className="no-custom-btn inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[var(--vintage-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--palette-ink)]"
                onClick={() => setFiltersOpen(false)}
              >
                Ver resultados
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-[var(--dark-muted)]">
              Tip: deslizá hacia abajo o tocá fuera para cerrar.
            </p>
          </div>
        </div>
      ) : null}

      <article className={isFiltering ? 'filter-grid-updating' : ''}>
        <ProductGrid
          filters={{ q }}
          items={featured}
          parentLoading={productsLoading}
        />
      </article>
    </>
  )
}
