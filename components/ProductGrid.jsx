"use client"

import React, { useMemo } from 'react'
import ProductCard from './ProductCard'
import { useProducts } from '../hooks/useProducts'

export default function ProductGrid({
  filters = {},
  items: itemsProp,
  parentLoading = false,
  primaryImageOnly = false
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
      <div className="w-full py-10 md:py-14 flex flex-col items-center justify-center gap-3">
        <div className="app-loading-spinner" aria-hidden />
        <p className="text-sm text-[var(--dark-muted)]">Cargando productos…</p>
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

      <div className="grid w-full min-w-0 grid-cols-1 gap-5 max-[767px]:gap-6 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8">
        {filteredItems.map((item, idx) => (
          <div key={`${item.id ?? item.slug ?? idx}-${filters.q || ''}`} className="home-grid-product-cell min-w-0 w-full">
            <ProductCard item={item} priority={idx < 3} primaryImageOnly={primaryImageOnly} />
          </div>
        ))}
      </div>
    </div>
  )
}
