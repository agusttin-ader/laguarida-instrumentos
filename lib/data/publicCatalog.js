import { getSupabaseServerClient } from '../supabase/server'
import {
  isContingencyActive,
  recordSupabaseFailure,
  recordSupabaseSuccess,
} from '../supabase/contingency'
import { getBackupProducts } from './localProductsBackup'
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

/**
 * Listado público: siempre desde backup local (sin Supabase).
 */
export async function getPublicCatalogRows({ includeReserved = false } = {}) {
  return backupCatalog({ includeReserved })
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
