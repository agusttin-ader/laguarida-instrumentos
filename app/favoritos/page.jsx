"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import ProductCard from '../../components/ProductCard'
import { useFavorites } from '../../components/ProductShareAndFavorite'
import { useProducts } from '../../hooks/useProducts'

export default function FavoritosPage() {
  const { slugs } = useFavorites()
  const { products: allProducts, loading } = useProducts({ shuffleCatalog: false })

  const slugSet = useMemo(() => new Set(slugs), [slugs.join(',')])
  const products = useMemo(
    () => (slugs.length === 0 ? [] : allProducts.filter((p) => slugSet.has(p.slug || p.id))),
    [allProducts, slugs.length, slugSet]
  )

  return (
    <div className="container-tight pt-10 sm:pt-14 pb-28 md:pb-12">
      <header className="mb-6 md:mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-1">Tu selección</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#131722] dark:text-[#f5f7ff]">
          Favoritos
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {slugs.length === 0
            ? 'Aún no tenés productos guardados. Agregá desde la ficha de cada producto haciendo click en el corazón.'
            : `${slugs.length} ${slugs.length === 1 ? 'producto' : 'productos'} guardado${slugs.length === 1 ? '' : 's'} en este dispositivo.`}
        </p>
      </header>

      {loading && slugs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] overflow-hidden border border-white/10 bg-[#15161a] animate-pulse">
              <div className="w-full bg-white/10" style={{ aspectRatio: '5/4' }} />
              <div className="p-4">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#15161a] p-10 text-center">
          <span className="text-4xl opacity-50" aria-hidden>🎸</span>
          <p className="mt-4 text-white/80 font-medium">Nada en tu selección</p>
          <p className="mt-2 text-sm text-white/55">Guardá productos con el corazón en la ficha de cada uno.</p>
          <Link href="/#seleccion-destacada" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors no-custom-btn">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((item) => (
            <div key={item.id || item.slug}>
              <ProductCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
