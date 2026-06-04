/**
 * Modos de catálogo y Supabase.
 *
 * Por defecto (dev y producción): la tienda pública lee `data/products-backup.json`
 * y fotos en `public/images/products/<slug>/` — casi sin llamadas a la API de productos.
 * El admin sigue usando Supabase para cargar/editar.
 *
 * Variables (.env.local o Vercel):
 *   NEXT_PUBLIC_USE_LOCAL_CATALOG=false → tienda pública lee Supabase en vivo (más API)
 *   SUPABASE_FULLY_BLOCKED=true            → apagar admin y DB; solo backup
 */

function envFlag(name) {
  const v = process.env[name]
  if (v === undefined || v === null || String(v).trim() === '') return null
  return String(v).trim().toLowerCase() === 'true'
}

const explicitLocal = process.env.NEXT_PUBLIC_USE_LOCAL_CATALOG
const explicitLocalSet = explicitLocal !== undefined && String(explicitLocal).trim() !== ''

/** Catálogo público (home, fichas, API sin scope=admin) lee el JSON local. */
export function useLocalCatalog() {
  if (envFlag('SUPABASE_FULLY_BLOCKED')) return true
  if (explicitLocalSet) return envFlag('NEXT_PUBLIC_USE_LOCAL_CATALOG')
  return true
}

/** Contingencia total: sin admin ni conexión a Supabase. */
export function isSupabaseFullyBlocked() {
  return envFlag('SUPABASE_FULLY_BLOCKED') === true
}

/** Login y altas/edición en panel (requiere Supabase). */
export function isSupabaseAdminEnabled() {
  return !isSupabaseFullyBlocked()
}

/** @deprecated Usar useLocalCatalog() o isSupabaseFullyBlocked(). */
export const SUPABASE_BLOCKED = isSupabaseFullyBlocked()
