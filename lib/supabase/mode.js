/**
 * Modos de catálogo y Supabase.
 *
 * Desarrollo (por defecto): catálogo público desde `data/products-backup.json` (casi sin queries).
 * Producción (por defecto): catálogo desde Supabase con caché de 5 min.
 *
 * Variables (.env.local o Vercel):
 *   NEXT_PUBLIC_USE_LOCAL_CATALOG=true   → forzar backup en cualquier entorno
 *   NEXT_PUBLIC_USE_LOCAL_CATALOG=false  → forzar Supabase en local
 *   SUPABASE_FULLY_BLOCKED=true          → apagar todo (admin + DB); solo backup
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
  return process.env.NODE_ENV === 'development'
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
