"use client"

import React, { useMemo } from 'react'
import ProductGrid from './ProductGrid'
import { useProducts } from '../hooks/useProducts'

export default function LowCostSection() {
  const { products } = useProducts({ shuffleCatalog: false })
  const lowCostProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((p) => p.low_cost === true) : []),
    [products]
  )

  if (!lowCostProducts.length) return null

  return (
    <section id="low-cost" className="mt-8 sm:mt-10 md:mt-12" aria-labelledby="low-cost-heading">
      <h2
        id="low-cost-heading"
        className="section-title-premium section-underline-ocre text-gray-900 dark:text-white mb-4 sm:mb-5 md:mb-6 section-heading-entrance"
      >
        Low cost
      </h2>
      <ProductGrid items={lowCostProducts} />
    </section>
  )
}
