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
        <p className="section-kicker-minimal text-white/60">Relacionado</p>
        <h3 className="mt-2 section-title-minimal section-underline-ocre text-white">Productos relacionados</h3>
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
        // If we have 4 or more related items show a horizontal slider (CSS-only)
        (related.length >= 4) ? (
          <div className="-mx-4 px-4 md:mx-0 md:px-0">
            <div className="related-slider flex flex-nowrap gap-6 overflow-x-auto snap-x snap-mandatory py-2">
              {related.map(item => (
                <div key={item.id} className="snap-start flex-shrink-0 min-w-[46%] sm:min-w-[45%] md:min-w-[33%] lg:min-w-[22%]">
                  <ProductCard item={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {related.map(item => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )
      )}
    </section>
  )
}
