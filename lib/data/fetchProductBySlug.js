import { cache } from 'react'
import { getBackupProductBySlug } from './localProductsBackup'

/** Ficha de producto: siempre desde backup local (sin Supabase). */
export const fetchProductRowBySlug = cache(async (slug) => {
  if (!slug || typeof slug !== 'string') return null
  return getBackupProductBySlug(slug.trim())
})
