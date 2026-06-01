import { cache } from 'react'
import { getSupabaseServerClient } from '../supabase/server'
import { getBackupProductBySlug } from './localProductsBackup'
import { shouldReadCatalogFromBackup } from '../catalog/readSource'
import {
  recordSupabaseFailure,
  recordSupabaseSuccess,
} from '../supabase/contingency'

export const fetchProductRowBySlug = cache(async (slug) => {
  if (!slug || typeof slug !== 'string') return null
  const normalizedSlug = slug.trim()

  if (shouldReadCatalogFromBackup()) {
    return getBackupProductBySlug(normalizedSlug)
  }

  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', normalizedSlug)
      .maybeSingle()
    if (error) throw error
    if (!data) return getBackupProductBySlug(normalizedSlug)
    if (String(data.listing_status || 'available') === 'reserved') return null
    recordSupabaseSuccess()
    return data
  } catch (err) {
    recordSupabaseFailure(err)
    return getBackupProductBySlug(normalizedSlug)
  }
})
