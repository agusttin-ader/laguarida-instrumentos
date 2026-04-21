"use client"

import React, { useMemo } from 'react'
import ProductGrid from './ProductGrid'
import ScrollReveal from './ScrollReveal'
import { useProducts } from '../hooks/useProducts'

export default function LowCostSection() {
  const { products, loading } = useProducts({ shuffleCatalog: false })
  const lowCostProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((p) => p.low_cost === true) : []),
    [products]
  )

  if (!loading && !lowCostProducts.length) return null

  return (
    <section id="low-cost" className="mt-6 sm:mt-8 md:mt-10" aria-labelledby="low-cost-heading">
      <ScrollReveal className="mb-3 sm:mb-4 md:mb-5" threshold={0.1} rootMargin="0px 0px -6% 0px">
        <h2
          id="low-cost-heading"
          className="section-title-premium section-underline-ocre text-gray-900 dark:text-white"
        >
          Low cost
        </h2>
      </ScrollReveal>

      <ProductGrid items={lowCostProducts} parentLoading={loading} primaryImageOnly />
    </section>
  )
}
