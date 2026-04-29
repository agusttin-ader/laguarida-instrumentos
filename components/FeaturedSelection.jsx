"use client"

import React, { useEffect, useState } from 'react'
import ProductGrid from './ProductGrid'
import { useProducts } from '../hooks/useProducts'

export default function FeaturedSelection() {
  const [q, setQ] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
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

  return (
    <>
      <div className="mb-3 w-full min-w-0 sm:mb-4 md:mb-5">
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
      </div>

      <article className={isFiltering ? 'filter-grid-updating' : ''}>
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
