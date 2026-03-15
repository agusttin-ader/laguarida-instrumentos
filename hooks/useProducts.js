"use client"

import { useCallback, useEffect, useState } from 'react'
import shuffleArray from '../lib/utils/shuffle'
import normalizeProduct from '../lib/utils/normalizeProduct'

const CACHE_TTL_MS = 60 * 1000 // 1 minute
let cache = { data: null, timestamp: 0 }
let inFlight = null

async function fetchProducts() {
  const res = await fetch('/api/products', { cache: 'default' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText} ${text}`)
  }
  const data = await res.json()
  const normalized = Array.isArray(data) ? data.map((d) => normalizeProduct(d)) : []
  return normalized
}

function getCached() {
  if (cache.data !== null && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data
  }
  return null
}

/**
 * Shared products hook: in-memory cache + single in-flight request deduplication.
 * Use across ProductGrid, HeroMonolith, FavoritosPage to avoid duplicate fetches.
 */
export function useProducts(options = {}) {
  const { shuffleCatalog = false } = options
  const [products, setProducts] = useState(() => getCached())
  const [loading, setLoading] = useState(() => getCached() === null)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    cache = { data: null, timestamp: 0 }
    inFlight = null
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      cache = { data, timestamp: Date.now() }
      const list = shuffleCatalog ? shuffleArray([...data]) : data
      setProducts(list)
      return list
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setProducts([])
      throw err
    } finally {
      setLoading(false)
      inFlight = null
    }
  }, [shuffleCatalog])

  useEffect(() => {
    const cached = getCached()
    if (cached !== null) {
      setProducts(shuffleCatalog ? shuffleArray([...cached]) : cached)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    if (!inFlight) {
      inFlight = fetchProducts()
    }

    const promise = inFlight
    promise
      .then((normalized) => {
        if (cancelled) return
        cache = { data: normalized, timestamp: Date.now() }
        inFlight = null
        const list = shuffleCatalog ? shuffleArray([...normalized]) : normalized
        setProducts(list)
        setLoading(false)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setProducts([])
          setLoading(false)
        }
        inFlight = null
      })

    return () => { cancelled = true }
  }, [shuffleCatalog])

  return { products: products ?? [], loading, error, refetch }
}
