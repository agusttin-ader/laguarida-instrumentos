"use client"

import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard'

export default function RelatedProducts(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load(){
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/products')
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText} ${text}`)
        }
        const data = await res.json()
        if (!cancelled) {
          const { default: normalizeProduct } = await import('../lib/utils/normalizeProduct')
          setProducts(Array.isArray(data) ? data.map(d => normalizeProduct(d)) : [])
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const related = products.slice(0, 4)

  return (
    <section className="mt-20 container-tight">
      <div className="mb-10">
        <p className="text-sm muted-text uppercase">Relacionado</p>
        <h3 className="mt-2 display-xl">Productos relacionados</h3>
      </div>

      {loading ? (
        <div className="mb-6">Cargando relacionados…</div>
      ) : null}

      {error ? (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-800">Error al cargar productos: {error}</div>
      ) : null}

      {!loading && related.length === 0 ? (
        <div className="py-6 p-4 rounded bg-white text-sm muted-text">No hay productos relacionados disponibles.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {related.map(item => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
