"use client"

import React, { useMemo } from 'react'
import ProductCard from '../../components/ProductCard'
import Button from '../../components/Button'
import { useFavorites } from '../../components/ProductShareAndFavorite'
import { useProducts } from '../../hooks/useProducts'
import { useSoftEnterAfterSlowLoad } from '../../hooks/useSoftEnterAfterSlowLoad'
import FadeInView from '../../components/motion/FadeInView'
import ProductGridMotion from '../../components/motion/ProductGridMotion'
import { SITE_MARK_SRC } from '../../lib/branding/logo'

export default function FavoritosPage() {
  const { slugs } = useFavorites()
  const { products: allProducts, loading } = useProducts({ shuffleCatalog: false })

  const slugSet = useMemo(() => new Set(slugs), [slugs])
  const products = useMemo(
    () => (slugs.length === 0 ? [] : allProducts.filter((p) => slugSet.has(p.slug || p.id))),
    [allProducts, slugs.length, slugSet]
  )

  const favoritesGridLoading = loading && slugs.length > 0
  const softGridEnter = useSoftEnterAfterSlowLoad(favoritesGridLoading, 420)

  return (
    <div className="container-tight favoritos-page pt-6 max-md:pt-5 sm:pt-14 pb-6 max-md:pb-5 md:pb-12">
      <FadeInView as="header" className="mb-5 max-md:mb-4 md:mb-8">
        <p className="section-kicker-minimal">Tu selección</p>
        <h1 className="section-heading-editorial mt-1.5 max-md:text-[1.5rem]">
          Favoritos
        </h1>
        <p className="mt-2 text-sm text-[var(--dark-muted)]">
          {slugs.length === 0
            ? 'Aún no tenés productos guardados. Agregá desde la ficha de cada producto haciendo click en el corazón.'
            : `${slugs.length} ${slugs.length === 1 ? 'producto' : 'productos'} guardado${slugs.length === 1 ? '' : 's'} en este dispositivo.`}
        </p>
      </FadeInView>

      {loading && slugs.length > 0 ? (
        <div className="w-full py-10 md:py-14 flex flex-col items-center justify-center gap-3">
          <div className="app-loading-spinner" aria-hidden />
          <p className="text-sm text-[var(--dark-muted)]">Cargando productos…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-[var(--dark-border)] bg-[var(--dark-bg-card)] p-7 sm:p-10 text-center">
          <div className="product-card-image-fallback mx-auto flex h-16 w-16 items-center justify-center opacity-50" aria-hidden>
            <img
              src={SITE_MARK_SRC}
              alt=""
              className="product-card-image-fallback__logo product-card-image-fallback__logo--site"
            />
          </div>
          <p className="mt-4 text-white/80 font-medium">Nada en tu selección</p>
          <p className="mt-2 text-sm text-white/55">Guardá productos con el corazón en la ficha de cada uno.</p>
          <Button href="/catalogo" variant="ghost" className="mt-6">
            Ver catálogo
          </Button>
        </div>
      ) : (
        <ProductGridMotion
          className={`product-grid--enter grid grid-cols-2 items-start gap-x-2.5 gap-y-3 max-md:gap-x-2.5 max-md:gap-y-3 md:auto-rows-fr md:items-stretch md:grid-cols-2 md:gap-6 lg:grid-cols-3${softGridEnter ? ' product-grid--slow-enter' : ''}`}
        >
          {products.map((item, idx) => (
            <div
              key={item.id || item.slug}
              className="home-grid-product-cell min-w-0 max-md:h-auto md:h-full [content-visibility:auto] [contain-intrinsic-size:auto_18rem] md:[contain-intrinsic-size:auto_28rem]"
              style={{ '--enter-i': idx }}
            >
              <ProductCard item={item} maxGalleryImages={1} />
            </div>
          ))}
        </ProductGridMotion>
      )}
    </div>
  )
}
