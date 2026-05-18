import { cache } from 'react'
import { getSupabaseServerClient } from '../supabase/server'
import { getBackupProductBySlug } from './localProductsBackup'

/** Una fila cruda de `products` por slug; deduplica dentro del mismo request (metadata + page). */
export const fetchProductRowBySlug = cache(async (slug) => {
  if (!slug || typeof slug !== 'string') return null
  const normalizedSlug = slug.trim()
  try {
    const supabase = getSupabaseServerClient()
    // `*` evita 400 si el esquema no tiene columnas opcionales puntuales.
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', normalizedSlug)
      .maybeSingle()
    if (error || !data) return getBackupProductBySlug(normalizedSlug)
    if (String(data.listing_status || 'available') === 'reserved') return null
    return data
  } catch {
    return getBackupProductBySlug(normalizedSlug)
  }
})
