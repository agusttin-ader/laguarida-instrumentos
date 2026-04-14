"use client"

import React, { useMemo } from 'react'
import ProductGrid from './ProductGrid'
import MobileCatalogShowcaseSlider from './MobileCatalogShowcaseSlider'
import ScrollReveal from './ScrollReveal'
import { useMobileHomeCatalog } from './MobileHomeCatalogContext'
import { useProducts } from '../hooks/useProducts'

export default function LowCostSection() {
  const { effectiveView, isMobile, setView } = useMobileHomeCatalog()
  const { products, loading } = useProducts({ shuffleCatalog: false })
  const lowCostProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((p) => p.low_cost === true) : []),
    [products]
  )

  if (!loading && !lowCostProducts.length) return null

  const hideGridMobile =
    isMobile && effectiveView === 'landing' && !loading && lowCostProducts.length > 0
  const showMobileSlider = isMobile && effectiveView === 'landing'
  const showMobileExpand =
    isMobile && effectiveView === 'landing' && !loading && lowCostProducts.length > 0

  return (
    <section id="low-cost" className="mt-8 sm:mt-10 md:mt-12" aria-labelledby="low-cost-heading">
      <ScrollReveal className="mb-4 sm:mb-5 md:mb-6" threshold={0.1} rootMargin="0px 0px -6% 0px">
        <h2
          id="low-cost-heading"
          className="section-title-premium section-underline-ocre text-gray-900 dark:text-white px-4 md:px-0"
        >
          Low cost
        </h2>
      </ScrollReveal>

      {showMobileSlider ? (
        <div className="mb-4 px-0 md:hidden">
          <MobileCatalogShowcaseSlider items={lowCostProducts} loading={loading} />
        </div>
      ) : null}

      {showMobileExpand ? (
        <div className="mb-4 px-4 md:hidden">
          <button
            type="button"
            className="no-custom-btn w-full min-h-[48px] rounded-xl border border-white/14 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-[var(--vintage-gold)]/35 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]"
            onClick={() => setView('lowCost')}
          >
            Ver catálogo Low cost completo
          </button>
        </div>
      ) : null}

      <div className={hideGridMobile ? 'max-[768px]:hidden' : ''}>
        <ProductGrid items={lowCostProducts} parentLoading={loading} primaryImageOnly />
      </div>
    </section>
  )
}
