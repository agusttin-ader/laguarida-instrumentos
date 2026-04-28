"use client"

import { useCallback, useEffect, useState } from 'react'
import normalizeProduct from '../lib/utils/normalizeProduct'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 min — menos requests al API / Supabase entre visitas
let cache = { data: null, timestamp: 0 }
let inFlight = null

function getWeekKey(now = new Date()) {
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dayOfYear = Math.floor((current - yearStart) / 86400000) + 1
  const week = Math.ceil(dayOfYear / 7)
  return `${now.getUTCFullYear()}-W${week}`
}

function stableHash(input) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function weeklyRotateCatalog(list) {
  const weekKey = getWeekKey()
  return [...list]
    .map((item, idx) => ({
      item,
      score: stableHash(`${weekKey}:${item?.slug || item?.id || idx}`),
      idx,
    }))
    .sort((a, b) => a.score - b.score || a.idx - b.idx)
    .map((entry) => entry.item)
}

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

export function useProducts(options = {}) {
  const { shuffleCatalog = false, enabled = true } = options
  const [products, setProducts] = useState(() => (enabled ? getCached() : []))
  const [loading, setLoading] = useState(() => (enabled ? getCached() === null : false))
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!enabled) return []
    cache = { data: null, timestamp: 0 }
    inFlight = null
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      cache = { data, timestamp: Date.now() }
      const list = shuffleCatalog ? weeklyRotateCatalog(data) : data
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
  }, [shuffleCatalog, enabled])

  useEffect(() => {
    if (!enabled) return

    const cached = getCached()
    if (cached !== null) {
      setProducts(shuffleCatalog ? weeklyRotateCatalog(cached) : cached)
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
        const list = shuffleCatalog ? weeklyRotateCatalog(normalized) : normalized
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
  }, [shuffleCatalog, enabled])

  return { products: products ?? [], loading, error, refetch }
}
