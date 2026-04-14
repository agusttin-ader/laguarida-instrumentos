"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import ProductCard from '../../components/ProductCard'
import ScrollReveal from '../../components/ScrollReveal'
import { useFavorites } from '../../components/ProductShareAndFavorite'
import { useProducts } from '../../hooks/useProducts'

export default function FavoritosPage() {
  const { slugs } = useFavorites()
  const { products: allProducts, loading } = useProducts({ shuffleCatalog: false })

  const slugSet = useMemo(() => new Set(slugs), [slugs])
  const products = useMemo(
    () => (slugs.length === 0 ? [] : allProducts.filter((p) => slugSet.has(p.slug || p.id))),
    [allProducts, slugs.length, slugSet]
  )

  return (
    <div className="container-tight pt-10 sm:pt-14 pb-8 md:pb-12">
      <header className="mb-6 md:mb-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] overflow-hidden border border-[var(--dark-border)] bg-[var(--dark-bg-card)] animate-pulse">
              <div className="w-full bg-white/10" style={{ aspectRatio: '5/4' }} />
              <div className="p-4">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-[var(--dark-border)] bg-[var(--dark-bg-card)] p-10 text-center">
          <span className="text-4xl opacity-50" aria-hidden>🎸</span>
          <p className="mt-4 text-white/80 font-medium">Nada en tu selección</p>
          <p className="mt-2 text-sm text-white/55">Guardá productos con el corazón en la ficha de cada uno.</p>
          <Link href="/#seleccion-destacada" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors no-custom-btn">
            Ver selección destacada
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-4 md:gap-6">
          {products.map((item, idx) => (
            <ScrollReveal
              key={item.id || item.slug}
              className="min-w-0"
              delay={Math.min(idx, 12) * 55}
              threshold={0.06}
              rootMargin="0px 0px -10% 0px"
            >
              <ProductCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
