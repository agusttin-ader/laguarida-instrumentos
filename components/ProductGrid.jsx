"use client"

import React, { useMemo } from 'react'
import ProductCard from './ProductCard'
import { useProducts } from '../hooks/useProducts'

export default function ProductGrid({
  filters = {},
  items: itemsProp,
  parentLoading = false,
  maxGalleryImages = 1,
  priorityFirstCard = false
}) {
  const fetchSelf = itemsProp === undefined
  const { products, loading, error } = useProducts({ shuffleCatalog: true, enabled: fetchSelf })
  const items = fetchSelf ? products : itemsProp
  const isLoading = fetchSelf ? loading : parentLoading
  const hasError = fetchSelf ? error : null

  const filteredItems = useMemo(() => {
    if (!items.length) return []
    const q = filters.q && String(filters.q).trim()
    const brand = filters.brand && String(filters.brand).trim()
    const model = filters.model && String(filters.model).trim()
    const mics = filters.mics && String(filters.mics).trim()
    const bridge = filters.bridge && String(filters.bridge).trim()
    if (!q && !brand && !model && !mics && !bridge) return items
    const qLower = q ? q.toLowerCase() : ''
    const brandLower = brand ? brand.toLowerCase() : ''
    const modelLower = model ? model.toLowerCase() : ''
    const micsLower = mics ? mics.toLowerCase() : ''
    const bridgeLower = bridge ? bridge.toLowerCase() : ''
    return items.filter((item) => {
      if (qLower) {
        const hay = (String(item.name || '') + ' ' + String(item.model || '') + ' ' + String(item.description || '')).toLowerCase()
        if (!hay.includes(qLower)) return false
      }
      if (brandLower && !String(item.name || '').toLowerCase().includes(brandLower)) return false
      if (modelLower && !String(item.model || item.name || '').toLowerCase().includes(modelLower)) return false
      if (micsLower && !String(item.mics || '').toLowerCase().includes(micsLower)) return false
      if (bridgeLower) {
        const hay = (String(item.description || '') + ' ' + String(item.name || '')).toLowerCase()
        if (!hay.includes(bridgeLower)) return false
      }
      return true
    })
  }, [items, filters.q, filters.brand, filters.model, filters.mics, filters.bridge])

  if (isLoading) {
    return (
      <div className="w-full min-w-0">
        <div className="mb-4 flex items-center gap-2 md:hidden" aria-hidden>
          <div className="h-2.5 w-24 rounded-full bg-white/10 animate-pulse" />
          <div className="h-2.5 w-16 rounded-full bg-white/10 animate-pulse" />
        </div>
        <div className="grid w-full min-w-0 grid-cols-1 gap-5 max-[767px]:gap-6 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8" aria-hidden>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className="overflow-hidden rounded-2xl md:rounded-3xl border border-white/8 bg-[var(--dark-bg-card)]">
              <div className="aspect-[4/5] w-full bg-[linear-gradient(110deg,rgba(255,255,255,0.03),rgba(255,255,255,0.07),rgba(255,255,255,0.03))] bg-[length:220%_100%] animate-[shimmer_1.9s_ease-in-out_infinite]" />
              <div className="p-4 md:p-5">
                <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                <div className="mt-2 h-3 w-2/3 rounded bg-white/10 animate-pulse" />
                <div className="mt-3.5 h-4 w-1/3 rounded bg-white/15 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--dark-muted)] md:hidden">Cargando productos…</p>
        <div className="hidden py-10 md:py-14 md:flex md:flex-col md:items-center md:justify-center md:gap-3">
          <div className="app-loading-spinner" aria-hidden />
          <p className="text-sm text-[var(--dark-muted)]">Cargando productos…</p>
        </div>
      </div>
    )
  }
  if (!isLoading && items.length === 0 && !hasError) {
    return (
      <div className="py-6 p-6 bg-[var(--dark-bg-card)] rounded-xl border border-[var(--dark-border)]">
        <h3 className="text-lg font-semibold text-[var(--dark-text-primary)]">No hay productos</h3>
        <p className="mt-2 text-sm text-[var(--dark-muted)]">Aún no hay productos disponibles. Añade algunos desde el panel de administración.</p>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0">
      {hasError ? (
        <div className="mb-6 p-4 rounded bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200">Error al cargar productos: {hasError}</div>
      ) : null}

      <div className="grid w-full min-w-0 auto-rows-fr grid-cols-1 items-stretch gap-5 max-[767px]:gap-6 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8">
        {filteredItems.map((item, idx) => (
          <div
            key={`${item.id ?? item.slug ?? idx}-${filters.q || ''}`}
            className="home-grid-product-cell flex h-full min-w-0 w-full [content-visibility:auto] [contain-intrinsic-size:auto_28rem]"
          >
            <ProductCard
              item={item}
              priority={priorityFirstCard && idx === 0}
              maxGalleryImages={maxGalleryImages}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
