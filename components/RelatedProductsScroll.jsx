"use client"

import ProductCard from './ProductCard'
import { useNativeScrollCarousel } from '../hooks/useNativeScrollCarousel'

export default function RelatedProductsScroll({ products = [] }) {
  const items = Array.isArray(products) ? products : []
  const itemsKey = items.map((item) => item.id || item.slug).join('|')
  const { scrollerRef, activeIndex, goToIndex } = useNativeScrollCarousel(items.length, itemsKey)

  if (!items.length) return null

  return (
    <>
      {/* Móvil: carrusel centrado con scroll nativo (como galería PDP) */}
      <div className="md:hidden">
        <div
          ref={scrollerRef}
          role="region"
          aria-roledescription="Carrusel"
          aria-label="Productos recomendados. Deslizá horizontalmente para ver más."
          className="native-mobile-carousel related-products-scroll flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => (
            <div
              key={item.id || item.slug}
              className="native-mobile-carousel__slide related-products-scroll__slide w-full shrink-0 snap-start snap-always"
              aria-hidden={i !== activeIndex}
            >
              <div className="related-products-scroll__card mx-auto w-full max-w-[min(20rem,calc(100vw-2rem))]">
                <ProductCard item={item} maxGalleryImages={1} />
              </div>
            </div>
          ))}
        </div>

        {items.length > 1 ? (
          <div className="mt-3 flex items-center justify-center gap-3 px-0.5">
            <span className="sr-only">
              Producto {activeIndex + 1} de {items.length}
            </span>
            <div className="flex items-center gap-1.5" role="group" aria-label="Ir a un producto">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-current={i === activeIndex ? 'true' : undefined}
                  aria-label={`Producto ${i + 1}`}
                  onClick={() => goToIndex(i)}
                  className="no-custom-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-surface-2)]"
                >
                  <span
                    aria-hidden
                    className={`block h-2 rounded-full transition-[width,background-color] duration-200 ${
                      i === activeIndex
                        ? 'w-6 bg-[var(--vintage-gold)]'
                        : 'w-2 bg-white/25'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] tabular-nums text-[var(--dark-muted)]" aria-hidden>
              {activeIndex + 1}/{items.length}
            </span>
          </div>
        ) : null}
      </div>

      {/* Desktop: grid */}
      <div className="related-products-scroll hidden md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
        {items.map((item) => (
          <div key={item.id || item.slug} className="min-w-0">
            <ProductCard item={item} maxGalleryImages={1} />
          </div>
        ))}
      </div>
    </>
  )
}
