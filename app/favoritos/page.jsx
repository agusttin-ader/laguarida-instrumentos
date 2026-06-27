"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import ProductCard from '../../components/ProductCard'
import { useFavorites } from '../../components/ProductShareAndFavorite'
import { useProducts } from '../../hooks/useProducts'
import { useSoftEnterAfterSlowLoad } from '../../hooks/useSoftEnterAfterSlowLoad'

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
    <div className="container-tight pt-6 max-md:pt-5 sm:pt-14 pb-6 max-md:pb-5 md:pb-12">
      <header className="mb-5 max-md:mb-4 md:mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--dark-muted)] mb-1">Tu selección</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--dark-text-primary)]">
          Favoritos
        </h1>
        <p className="mt-2 text-sm text-[var(--dark-muted)]">
          {slugs.length === 0
            ? 'Aún no tenés productos guardados. Agregá desde la ficha de cada producto haciendo click en el corazón.'
            : `${slugs.length} ${slugs.length === 1 ? 'producto' : 'productos'} guardado${slugs.length === 1 ? '' : 's'} en este dispositivo.`}
        </p>
      </header>

      {loading && slugs.length > 0 ? (
        <div className="w-full py-10 md:py-14 flex flex-col items-center justify-center gap-3">
          <div className="app-loading-spinner" aria-hidden />
          <p className="text-sm text-[var(--dark-muted)]">Cargando productos…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-[var(--dark-border)] bg-[var(--dark-bg-card)] p-7 sm:p-10 text-center">
          <span className="text-4xl opacity-50" aria-hidden>🎸</span>
          <p className="mt-4 text-white/80 font-medium">Nada en tu selección</p>
          <p className="mt-2 text-sm text-white/55">Guardá productos con el corazón en la ficha de cada uno.</p>
          <Link href="/catalogo" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors no-custom-btn">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 max-md:gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3${softGridEnter ? ' product-grid--slow-enter' : ''}`}
        >
          {products.map((item, idx) => (
            <div
              key={item.id || item.slug}
              className="home-grid-product-cell min-w-0 [content-visibility:auto] [contain-intrinsic-size:auto_28rem]"
              style={{ '--grid-cell-i': idx }}
            >
              <ProductCard item={item} maxGalleryImages={1} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
