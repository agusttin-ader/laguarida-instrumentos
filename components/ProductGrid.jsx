"use client"

import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import ScrollReveal from './ScrollReveal'

function shuffleArray(a) {
  const arr = [...a]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function ProductGrid({ filters = {} }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/products', { cache: 'no-store' })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText} ${text}`)
        }
        const data = await res.json()
        if (!cancelled) {
          const { default: normalizeProduct } = await import('../lib/utils/normalizeProduct')
          const normalized = Array.isArray(data) ? data.map(d => normalizeProduct(d)) : []
          setItems(shuffleArray(normalized))
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div className="py-6">Cargando productos…</div>
  }
  if (!loading && items.length === 0 && !error) {
    return (
      <div className="py-6 p-6 bg-white rounded shadow">
        <h3 className="text-lg font-semibold">No hay productos</h3>
        <p className="mt-2 text-sm muted-text">Aún no hay productos disponibles. Añade algunos desde el panel de administración.</p>
      </div>
    )
  }

  return (
    <div>
      {error ? (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-800">Error al cargar productos: {error}</div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items
          .filter((item) => {
            // free-text query
            if (filters.q && String(filters.q).trim() !== '') {
              const q = String(filters.q).trim().toLowerCase()
              const hay = (String(item.name || '') + ' ' + String(item.model || '') + ' ' + String(item.description || '')).toLowerCase()
              if (!hay.includes(q)) return false
            }
            // apply simple filters if provided
            if (filters.brand) {
              const name = String(item.name || '').toLowerCase()
              if (!name.includes(filters.brand.toLowerCase())) return false
            }
            if (filters.model) {
              const model = String(item.model || item.name || '').toLowerCase()
              if (!model.includes(filters.model.toLowerCase())) return false
            }
            if (filters.mics) {
              const m = String(item.mics || '').toLowerCase()
              if (!m.includes(filters.mics.toLowerCase())) return false
            }
            if (filters.bridge) {
              const hay = (String(item.description || '') + ' ' + String(item.name || '')).toLowerCase()
              if (!hay.includes(filters.bridge.toLowerCase())) return false
            }
            return true
          })
          .map((item, idx) => (
            <ScrollReveal key={item.id ?? idx} delay={idx * 12}>
              <ProductCard item={item} />
            </ScrollReveal>
          ))}
      </div>
    </div>
  )
}
