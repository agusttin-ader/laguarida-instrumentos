"use client"

import React, { useEffect, useMemo, useState } from 'react'
import ProductGrid from './ProductGrid'
import { useProducts } from '../hooks/useProducts'

export default function LowCostSection() {
  const [q, setQ] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const { products, loading } = useProducts({ shuffleCatalog: false })
  const lowCostProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((p) => p.low_cost === true) : []),
    [products]
  )

  useEffect(() => {
    if (!q) {
      setIsFiltering(false)
      return
    }
    setIsFiltering(true)
    const t = window.setTimeout(() => setIsFiltering(false), 260)
    return () => window.clearTimeout(t)
  }, [q])

  if (!loading && !lowCostProducts.length) return null

  return (
    <section id="low-cost" className="mt-8 sm:mt-10 md:mt-12" aria-labelledby="low-cost-heading">
      <div className="mb-3 sm:mb-4 md:mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 md:gap-6">
          <h2
            id="low-cost-heading"
            className="section-title-premium section-underline-ocre text-gray-900 dark:text-white"
          >
            Low cost
          </h2>
          <div className="order-3 w-full min-w-0 sm:order-none sm:w-auto">
            <div className={`search-pill w-full sm:max-w-sm ${isFiltering ? 'search-pill-filtering' : ''}`} role="search">
              <span className="search-icon flex-shrink-0" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                </svg>
              </span>
              <input
                aria-label="Buscar en low cost"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar en low cost"
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      <article className={isFiltering ? 'filter-grid-updating' : ''}>
        <ProductGrid items={lowCostProducts} parentLoading={loading} filters={{ q }} />
      </article>
    </section>
  )
}
