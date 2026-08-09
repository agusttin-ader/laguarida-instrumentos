import { unstable_cache } from 'next/cache'
import { getSupabaseServerClient } from '../supabase/server'
import { shouldReadCatalogFromBackup } from '../catalog/readSource'
import {
  isContingencyActive,
  recordSupabaseFailure,
  recordSupabaseSuccess,
} from '../supabase/contingency'
import { getBackupProducts } from './localProductsBackup'
import { PRODUCT_LIST_COLUMNS } from './productColumns'
import imageService from '../utils/imageService'

export const CATALOG_CACHE_SECONDS = 300

function withResolvedImageUrls(row) {
  if (!row || typeof row !== 'object') return row
  const p = { ...row }
  if (p.image_url) {
    const r = imageService.resolve(p.image_url)
    if (r) p.image_url = r
  }
  if (Array.isArray(p.images)) {
    p.images = p.images.map((u) => imageService.resolve(u) || u).filter(Boolean)
  }
  return p
}

function backupCatalog({ includeReserved }) {
  return getBackupProducts({ includeReserved })
}

async function fetchAvailableFromSupabase() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_LIST_COLUMNS)
    .eq('listing_status', 'available')
    .order('created_at', { ascending: false })
  if (error) throw error
  recordSupabaseSuccess()
  return Array.isArray(data) ? data.map(withResolvedImageUrls) : []
}

async function fetchAllFromSupabase() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  recordSupabaseSuccess()
  return Array.isArray(data) ? data.map(withResolvedImageUrls) : []
}

const cachedAvailable = unstable_cache(fetchAvailableFromSupabase, ['catalog-available'], {
  revalidate: CATALOG_CACHE_SECONDS,
  tags: ['catalog'],
})

const cachedAll = unstable_cache(fetchAllFromSupabase, ['catalog-all'], {
  revalidate: CATALOG_CACHE_SECONDS,
  tags: ['catalog'],
})

async function loadFromSupabase(includeReserved) {
  return includeReserved ? cachedAll() : cachedAvailable()
}

/**
 * Listado público. Local o contingencia → backup; si no, Supabase cacheado con fallback.
 */
export async function getPublicCatalogRows({ includeReserved = false } = {}) {
  if (shouldReadCatalogFromBackup()) {
    return backupCatalog({ includeReserved })
  }

  try {
    const rows = await loadFromSupabase(includeReserved)
    if (rows.length) return rows
  } catch (err) {
    recordSupabaseFailure(err)
  }

  const fallback = backupCatalog({ includeReserved })
  return fallback.length ? fallback : []
}

/** Panel admin: Supabase primero; si cuota/caída, listado desde backup (solo lectura útil). */
export async function getAdminCatalogFromSupabase() {
  if (isContingencyActive()) {
    return backupCatalog({ includeReserved: true })
  }

  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    recordSupabaseSuccess()
    return Array.isArray(data) ? data.map(withResolvedImageUrls) : []
  } catch (err) {
    recordSupabaseFailure(err)
    const fallback = backupCatalog({ includeReserved: true })
    if (fallback.length) return fallback
    throw err
  }
}
